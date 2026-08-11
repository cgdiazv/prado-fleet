import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Retrieve all fuel logs & compute analytics dynamically from Supabase
export async function GET() {
  try {
    const logs = await prisma.fuelLog.findMany({
      orderBy: { loggedAt: "desc" },
      include: {
        vehicle: {
          select: { name: true },
        },
      },
    });

    const totalSpend = logs.reduce((acc, curr) => acc + curr.totalCost, 0);
    const totalGallons = logs.reduce((acc, curr) => acc + curr.gallons, 0);

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      vehicle: log.vehicle?.name || "Unit #01 - Ford F-150",
      driver: log.driverName,
      gallons: `${log.gallons.toFixed(1)} gal`,
      rawGallons: log.gallons,
      amount: `$${log.totalCost.toFixed(2)}`,
      rawAmount: log.totalCost,
      odometer: `${log.odometer.toLocaleString()} mi`,
      location: "Fleet Fuel Card Station",
      status: "Verified",
      date: new Date(log.loggedAt).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    return NextResponse.json({
      totalSpend: `$${totalSpend.toFixed(2)}`,
      totalGallons: `${totalGallons.toFixed(1)} gal`,
      transactionCount: logs.length,
      logs: formattedLogs,
    });
  } catch (error) {
    console.error("[GET /api/fuel error]:", error);
    return NextResponse.json({ error: "Failed to fetch fuel logs" }, { status: 500 });
  }
}

// POST: Create a new fuel log entry in Supabase
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleName, driverName, gallons, totalCost, odometer } = body;

    if (!gallons || !totalCost) {
      return NextResponse.json({ error: "Gallons and total cost are required" }, { status: 400 });
    }

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

    const newLog = await prisma.fuelLog.create({
      data: {
        vehicleId: vehicle.id,
        driverName: driverName || "Active Driver",
        gallons: parseFloat(gallons),
        totalCost: parseFloat(totalCost),
        odometer: odometer ? parseInt(odometer) : 48210,
      },
    });

    return NextResponse.json({ success: true, log: newLog });
  } catch (error) {
    console.error("[POST /api/fuel error]:", error);
    return NextResponse.json({ error: "Failed to log fuel entry" }, { status: 500 });
  }
}

// DELETE: Delete a fuel log entry from Supabase
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Fuel log ID required" }, { status: 400 });
    }

    await prisma.fuelLog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("[DELETE /api/fuel error]:", error);
    return NextResponse.json({ error: "Failed to delete fuel log" }, { status: 500 });
  }
}
