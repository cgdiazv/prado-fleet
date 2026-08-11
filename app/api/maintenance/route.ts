import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Retrieve all active maintenance work orders from Supabase
export async function GET() {
  try {
    const orders = await prisma.maintenanceOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: {
          select: { name: true },
        },
      },
    });

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      vehicle: o.vehicle?.name || "Unit #01 - Ford F-150",
      issue: o.title,
      description: o.description || "",
      priority: o.priority === "HIGH" || o.priority === "CRITICAL" ? "High" : "Routine",
      rawPriority: o.priority,
      status: o.status === "OPEN" ? "Pending Schedule" : o.status === "IN_PROGRESS" ? "In Shop" : "Completed",
      rawStatus: o.status,
      assignedTo: o.assignedTo || "Unassigned Mechanic",
      cost: o.cost ? `$${o.cost.toFixed(2)}` : "TBD",
      date: new Date(o.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
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

    let vehicle = await prisma.vehicle.findFirst({
      where: { name: vehicleName },
    });

    if (!vehicle) {
      vehicle = await prisma.vehicle.findFirst();
    }

    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          name: vehicleName || "Unit #01 - Ford F-150",
          status: "MAINTENANCE",
        },
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
        assignedTo: assignedTo || "Lead Technician Dave",
        cost: cost ? parseFloat(cost) : null,
      },
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error("[POST /api/maintenance error]:", error);
    return NextResponse.json({ error: "Failed to create work order" }, { status: 500 });
  }
}

// PUT: Update work order status (e.g. IN_PROGRESS, COMPLETED)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const updated = await prisma.maintenanceOrder.update({
      where: { id },
      data: { status: status || "COMPLETED" },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("[PUT /api/maintenance error]:", error);
    return NextResponse.json({ error: "Failed to update work order" }, { status: 500 });
  }
}

// DELETE: Remove a work order from Supabase
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    await prisma.maintenanceOrder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("[DELETE /api/maintenance error]:", error);
    return NextResponse.json({ error: "Failed to delete work order" }, { status: 500 });
  }
}
