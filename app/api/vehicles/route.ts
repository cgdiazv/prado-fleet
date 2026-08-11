import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Retrieve all fleet vehicles/trucks from Supabase
export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        assignedDriver: {
          select: { id: true, name: true },
        },
        assets: {
          select: { id: true, name: true },
        },
      },
    });

    const formattedVehicles = vehicles.map((v) => ({
      id: v.id,
      name: v.name,
      vin: v.vin || "N/A",
      make: v.make || "Ford",
      model: v.model || "F-150",
      year: v.year || 2023,
      licensePlate: v.licensePlate || "TX-FLT01",
      status: v.status,
      assignedDriver: v.assignedDriver?.name || "Unassigned",
      assignedDriverId: v.assignedDriverId,
      assetCount: v.assets.length,
      destination: v.destination || "Depot Yard",
    }));

    return NextResponse.json({ vehicles: formattedVehicles });
  } catch (error) {
    console.error("[GET /api/vehicles error]:", error);
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

// POST: Register a new vehicle/truck in Supabase
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, vin, make, model, year, licensePlate, status, assignedDriverId } = body;

    if (!name) {
      return NextResponse.json({ error: "Vehicle name is required" }, { status: 400 });
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        name,
        vin: vin || `VIN-${Date.now().toString().slice(-8)}`,
        make: make || "Ford",
        model: model || "F-150",
        year: year ? parseInt(year) : 2023,
        licensePlate: licensePlate || "TX-PENDING",
        status: status || "ACTIVE",
        assignedDriverId: assignedDriverId || null,
      },
    });

    return NextResponse.json({ success: true, vehicle: newVehicle });
  } catch (error: any) {
    console.error("[POST /api/vehicles error]:", error);
    return NextResponse.json({ error: error.message || "Failed to create vehicle" }, { status: 500 });
  }
}

// PUT: Update an existing vehicle/truck in Supabase
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, vin, make, model, year, licensePlate, status, assignedDriverId } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "Vehicle ID and name are required" }, { status: 400 });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        name,
        vin,
        make,
        model,
        year: year ? parseInt(year) : undefined,
        licensePlate,
        status,
        assignedDriverId: assignedDriverId || null,
      },
    });

    return NextResponse.json({ success: true, vehicle: updatedVehicle });
  } catch (error) {
    console.error("[PUT /api/vehicles error]:", error);
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

// DELETE: Delete a vehicle/truck from Supabase
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Vehicle ID is required" }, { status: 400 });
    }

    // Unlink assets assigned to this vehicle
    await prisma.asset.updateMany({
      where: { assignedVehicleId: id },
      data: { assignedVehicleId: null },
    });

    // Delete inspection logs associated with vehicle
    await prisma.dvirInspection.deleteMany({
      where: { vehicleId: id },
    });

    // Delete maintenance orders associated with vehicle
    await prisma.maintenanceOrder.deleteMany({
      where: { vehicleId: id },
    });

    // Delete vehicle record
    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("[DELETE /api/vehicles error]:", error);
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
