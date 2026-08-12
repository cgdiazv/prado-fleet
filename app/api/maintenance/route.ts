import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { sendPartsRequisitionEmail } from "@/lib/email";

// Helper: get the current user from session cookie (best-effort, non-blocking)
async function getCurrentUserEmail(): Promise<{ email: string; name: string } | null> {
  try {
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    const session = await prisma.session.findFirst({
      where: { tokenHash: hashSessionToken(token), expiresAt: { gt: new Date() } },
      include: { user: { select: { email: true, name: true } } },
    });
    return session?.user ?? null;
  } catch {
    return null;
  }
}

// GET: Retrieve all active maintenance work orders with their parts history
export async function GET() {
  try {
    const orders = await prisma.maintenanceOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: { select: { name: true } },
        requisitions: { orderBy: { orderedAt: "desc" } },
      },
    });

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      vehicle: o.vehicle?.name || "Unit #01 - Ford F-150",
      issue: o.title,
      description: o.description || "",
      priority: o.priority === "HIGH" || o.priority === "CRITICAL" ? "High" : "Routine",
      rawPriority: o.priority,
      status:
        o.status === "OPEN"
          ? "Pending Schedule"
          : o.status === "IN_PROGRESS"
          ? "In Shop"
          : o.status === "PARTS_ORDERED"
          ? "Parts Ordered"
          : "Completed",
      rawStatus: o.status,
      assignedTo: o.assignedTo ?? null,
      cost: (() => { const total = o.requisitions.reduce((s, r) => s + r.totalCost, 0); return total > 0 ? `$${total.toFixed(2)}` : "TBD"; })(),
      date: new Date(o.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
      requisitions: o.requisitions.map((r) => ({
        id: r.id,
        partName: r.partName,
        partNumber: r.partNumber,
        supplier: r.supplier,
        supplierUrl: r.supplierUrl ?? null,
        quantity: r.quantity,
        unitCost: r.unitCost,
        totalCost: r.totalCost,
        orderedAt: new Date(r.orderedAt).toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      })),
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("[GET /api/maintenance error]:", error);
    return NextResponse.json({ error: "Failed to fetch maintenance orders" }, { status: 500 });
  }
}

// POST: Create a new maintenance work order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleName, title, description, priority, assignedTo, cost } = body;

    let vehicle = await prisma.vehicle.findFirst({ where: { name: vehicleName } });
    if (!vehicle) vehicle = await prisma.vehicle.findFirst();
    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: { name: vehicleName || "Unit #01 - Ford F-150", status: "MAINTENANCE" },
      });
    }

    const priorityEnum = priority === "High" || priority === "HIGH" ? "HIGH" : "MEDIUM";

    const newOrder = await prisma.maintenanceOrder.create({
      data: {
        vehicleId: vehicle.id,
        title: title || "DVIR Flagged Safety Defect",
        description: description || "Defect reported during driver inspection.",
        priority: priorityEnum,
        status: "OPEN",
        assignedTo: assignedTo || null,
        cost: cost ? parseFloat(cost) : null,
      },
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error("[POST /api/maintenance error]:", error);
    return NextResponse.json({ error: "Failed to create work order" }, { status: 500 });
  }
}

// PUT: Attach a parts requisition to a work order (persists line items, updates cost & status)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, cost, additionalCost, parts, vehicleName, workOrderTitle, assignedTo } = body;

    const existingOrder = await prisma.maintenanceOrder.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    }

    // Compute new cost
    let updatedCost = existingOrder.cost;
    if (typeof cost === "number") {
      updatedCost = cost;
    } else if (typeof additionalCost === "number") {
      updatedCost = (existingOrder.cost || 0) + additionalCost;
    }

    // Determine status: if parts are being ordered, advance to PARTS_ORDERED
    const newStatus = parts && Array.isArray(parts) && parts.length > 0
      ? "PARTS_ORDERED"
      : (status ?? existingOrder.status);

    const updateData: Record<string, unknown> = {};
    if (newStatus) updateData.status = newStatus;
    if (updatedCost !== undefined) updateData.cost = updatedCost;
    if (typeof assignedTo === "string") updateData.assignedTo = assignedTo;

    // Persist part requisition line items if provided
    if (parts && Array.isArray(parts) && parts.length > 0) {
      await prisma.partRequisition.createMany({
        data: parts.map((p: {
          partName: string;
          partNumber: string;
          supplier: string;
          supplierUrl?: string;
          quantity: number;
          unitCost: number;
        }) => ({
          workOrderId: id,
          partName: p.partName,
          partNumber: p.partNumber,
          supplier: p.supplier,
          supplierUrl: p.supplierUrl || null,
          quantity: p.quantity,
          unitCost: p.unitCost,
          totalCost: p.quantity * p.unitCost,
        })),
      });
    }

    const updated = await prisma.maintenanceOrder.update({
      where: { id },
      data: updateData,
    });

    // Send requisition confirmation email (non-blocking — errors don't fail the request)
    if (parts && Array.isArray(parts) && parts.length > 0) {
      const user = await getCurrentUserEmail();
      if (user?.email) {
        sendPartsRequisitionEmail({
          to: user.email,
          managerName: user.name,
          vehicleName: vehicleName || "Fleet Vehicle",
          workOrderTitle: workOrderTitle || "Maintenance Work Order",
          parts: parts.map((p: {
            partName: string;
            partNumber: string;
            supplier: string;
            supplierUrl?: string;
            quantity: number;
            unitCost: number;
          }) => ({
            partName: p.partName,
            partNumber: p.partNumber,
            supplier: p.supplier,
            supplierUrl: p.supplierUrl,
            quantity: p.quantity,
            unitCost: p.unitCost,
            totalCost: p.quantity * p.unitCost,
          })),
          grandTotal: additionalCost,
        }).catch((err) => console.error("[Email] Parts requisition email failed:", err));
      }
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("[PUT /api/maintenance error]:", error);
    return NextResponse.json({ error: "Failed to update work order" }, { status: 500 });
  }
}

// DELETE: Remove a work order
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }
    await prisma.maintenanceOrder.delete({ where: { id } });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("[DELETE /api/maintenance error]:", error);
    return NextResponse.json({ error: "Failed to delete work order" }, { status: 500 });
  }
}
