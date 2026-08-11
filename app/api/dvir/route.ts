import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDvirDefectAlertEmail } from "@/lib/email";

// GET: Retrieve all DVIR inspections from Supabase
export async function GET() {
  try {
    const dvirs = await prisma.dvirInspection.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: {
          select: { name: true },
        },
      },
    });

    const formattedLogs = dvirs.map((d) => ({
      id: d.id,
      vehicleName: d.vehicle?.name || "Unit #01 - Ford F-150",
      driverName: d.driverName,
      type: d.inspectionType,
      status: d.status || (d.passed ? "PASSED" : "DEFECTS_FOUND"),
      odometer: d.odometer,
      defects: d.defects || [],
      submittedAt: new Date(d.createdAt).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      signature: d.signature || d.driverName,
    }));

    return NextResponse.json({ logs: formattedLogs });
  } catch (error) {
    console.error("[GET /api/dvir error]:", error);
    return NextResponse.json({ error: "Failed to fetch DVIR records" }, { status: 500 });
  }
}

// POST: Create a new DVIR inspection record from Driver Portal
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { inspectionType, vehicleName, driverName, odometer, defects, notes, signature } = body;

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
          status: "ACTIVE",
        },
      });
    }

    const hasDefects = defects && defects.length > 0;

    const newDvir = await prisma.dvirInspection.create({
      data: {
        inspectionType: inspectionType === "POST_TRIP" ? "POST_TRIP" : "PRE_TRIP",
        vehicleId: vehicle.id,
        driverName: driverName || "Active Driver",
        odometer: odometer || 48210,
        passed: !hasDefects,
        status: hasDefects ? "DEFECTS_FOUND" : "PASSED",
        defects: defects || [],
        notes: notes || "",
        signature: signature || driverName || "Active Driver",
      },
    });

    if (hasDefects) {
      // Auto-update vehicle status to MAINTENANCE & ALERT
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { status: "MAINTENANCE", telematicsStatus: "ALERT" },
      });

      // Create automated Maintenance Work Order
      await prisma.maintenanceOrder.create({
        data: {
          vehicleId: vehicle.id,
          title: `DVIR Defect: ${defects.join(", ")}`,
          description: `Driver ${driverName || "Active Driver"} reported defects during ${inspectionType} inspection. Notes: ${notes || "None"}`,
          priority: "HIGH",
          status: "OPEN",
        },
      });

      // Dispatch live email alert via Resend API
      sendDvirDefectAlertEmail({
        to: "info@pradofleet.com",
        driverName: driverName || "Active Driver",
        vehicleName: vehicle.name,
        defects: defects || [],
        notes: notes || "",
      }).catch((err) => console.error("[DVIR Defect Email Error]:", err));
    }

    return NextResponse.json({ success: true, dvir: newDvir });
  } catch (error) {
    console.error("[POST /api/dvir error]:", error);
    return NextResponse.json({ error: "Failed to save DVIR record" }, { status: 500 });
  }
}

// PUT: Update DVIR status (e.g. escalate to WORK_ORDER_CREATED)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const updated = await prisma.dvirInspection.update({
      where: { id },
      data: { status: status || "WORK_ORDER_CREATED" },
    });

    return NextResponse.json({ success: true, dvir: updated });
  } catch (error) {
    console.error("[PUT /api/dvir error]:", error);
    return NextResponse.json({ error: "Failed to update DVIR status" }, { status: 500 });
  }
}