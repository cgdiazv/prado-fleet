import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Returns all active vehicle locations from Supabase database for Mapbox
export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        assignedDriver: {
          select: { name: true },
        },
      },
    });

    const formattedVehicles = vehicles.map((v) => ({
      id: v.id,
      name: v.name,
      driver: v.assignedDriver?.name || "Unassigned Driver",
      status: v.telematicsStatus.toLowerCase(),
      speed: Math.round(v.currentSpeed),
      destination: v.destination || "En Route",
      lat: v.lat ?? 32.7767,
      lng: v.lng ?? -96.797,
      updatedAt: v.updatedAt.toISOString(),
    }));

    return NextResponse.json({ vehicles: formattedVehicles, total: formattedVehicles.length });
  } catch (error) {
    console.error("[GET /api/telematics/location error]:", error);
    return NextResponse.json({ error: "Failed to fetch vehicle telematics" }, { status: 500 });
  }
}

// POST: Receives real-time GPS pings from driver mobile devices and updates Supabase
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleId, driver, lat, lng, speed } = body;

    if (!lat || !lng) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const currentSpeed = typeof speed === "number" ? Math.round(speed * 2.23694) : 0;
    const telematicsStatus = currentSpeed > 2 ? "MOVING" : "IDLE";

    // Find first vehicle or update by ID
    const targetVehicle = await prisma.vehicle.findFirst();

    if (targetVehicle) {
      const updated = await prisma.vehicle.update({
        where: { id: targetVehicle.id },
        data: {
          lat: Number(lat),
          lng: Number(lng),
          currentSpeed: currentSpeed,
          telematicsStatus: telematicsStatus,
        },
      });

      return NextResponse.json({
        success: true,
        location: {
          id: updated.id,
          name: updated.name,
          driver: driver || "Active Driver",
          status: updated.telematicsStatus.toLowerCase(),
          speed: Math.round(updated.currentSpeed),
          destination: updated.destination || "Live GPS Stream",
          lat: updated.lat,
          lng: updated.lng,
          updatedAt: updated.updatedAt.toISOString(),
        },
      });
    }

    return NextResponse.json({ error: "No vehicle found to update" }, { status: 404 });
  } catch (error) {
    console.error("[POST /api/telematics/location error]:", error);
    return NextResponse.json({ error: "Failed to process location ping" }, { status: 500 });
  }
}
