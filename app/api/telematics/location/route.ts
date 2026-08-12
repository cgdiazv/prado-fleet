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

    const BASE_DALLAS_COORDS = [
      { lat: 32.7767, lng: -96.797 },
      { lat: 32.7812, lng: -96.8021 },
      { lat: 32.7715, lng: -96.7892 },
      { lat: 32.7850, lng: -96.7910 },
      { lat: 32.7680, lng: -96.8050 },
    ];

    const formattedVehicles = vehicles.map((v, index) => {
      const defaultCoord = BASE_DALLAS_COORDS[index % BASE_DALLAS_COORDS.length];
      const validLat = typeof v.lat === "number" && !isNaN(v.lat) ? v.lat : defaultCoord.lat;
      const validLng = typeof v.lng === "number" && !isNaN(v.lng) ? v.lng : defaultCoord.lng;

      return {
        id: v.id,
        name: v.name,
        driver: v.assignedDriver?.name || "Unassigned Driver",
        status: v.telematicsStatus.toLowerCase(),
        speed: Math.round(v.currentSpeed),
        destination: v.destination || "En Route",
        lat: validLat,
        lng: validLng,
        updatedAt: v.updatedAt.toISOString(),
      };
    });

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

    const numLat = Number(lat);
    const numLng = Number(lng);

    if (isNaN(numLat) || isNaN(numLng) || numLat === 0 || numLng === 0) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const currentSpeed = typeof speed === "number" ? Math.round(speed * 2.23694) : 0;
    const telematicsStatus = currentSpeed > 2 ? "MOVING" : "IDLE";

    // 1. Find vehicle by ID
    let targetVehicle = null;

    if (vehicleId) {
      targetVehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    }

    // 2. Find by driver name
    if (!targetVehicle && driver) {
      const driverRecord = await prisma.driver.findFirst({
        where: { name: { equals: driver, mode: "insensitive" } },
        include: { vehicles: true },
      });
      if (driverRecord && driverRecord.vehicles.length > 0) {
        targetVehicle = driverRecord.vehicles[0];
      }
    }

    // 3. Fallback to first vehicle in database
    if (!targetVehicle) {
      targetVehicle = await prisma.vehicle.findFirst();
    }

    if (targetVehicle) {
      const updated = await prisma.vehicle.update({
        where: { id: targetVehicle.id },
        data: {
          lat: numLat,
          lng: numLng,
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
