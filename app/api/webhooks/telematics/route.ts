import { NextResponse } from "next/server";
import { appendAuditEntry } from "@/services/audit-store";

type TelematicsWebhookPayload = {
  provider?: string;
  eventId?: string;
  vehicleId?: string;
  timestamp?: string;
  lat?: number;
  lng?: number;
  speed?: number;
  fuelLevelPercentage?: number;
  checkEngineCode?: string;
  engineHours?: number;
  odometer?: number;
  geofenceId?: string;
  ignition?: "on" | "off";
};

export async function POST(request: Request) {
  let payload: TelematicsWebhookPayload;

  try {
    payload = (await request.json()) as TelematicsWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const requiredFields = ["provider", "eventId", "vehicleId", "timestamp", "lat", "lng", "speed", "fuelLevelPercentage"] as const;
  const missingFields = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: "Missing required telematics webhook fields.", missingFields },
      { status: 400 },
    );
  }

  const alerts: string[] = [];

  if (typeof payload.speed === "number" && payload.speed > 75) {
    alerts.push("overspeed");
  }

  if (typeof payload.fuelLevelPercentage === "number" && payload.fuelLevelPercentage < 15) {
    alerts.push("low_fuel");
  }

  if (payload.checkEngineCode) {
    alerts.push(`obd:${payload.checkEngineCode.toUpperCase()}`);
  }

  const storedRecord = await appendAuditEntry("telematics-webhooks", "telematics.position.received", {
    normalized: {
      provider: payload.provider,
      eventId: payload.eventId,
      vehicleId: payload.vehicleId,
      timestamp: payload.timestamp,
      location: { lat: payload.lat, lng: payload.lng },
      speed: payload.speed,
      fuelLevelPercentage: payload.fuelLevelPercentage,
      checkEngineCode: payload.checkEngineCode ?? null,
      engineHours: payload.engineHours ?? null,
      odometer: payload.odometer ?? null,
      geofenceId: payload.geofenceId ?? null,
      ignition: payload.ignition ?? null,
    },
    alerts,
  }, payload.provider ?? "telematics-provider");

  return NextResponse.json({
    ok: true,
    eventType: "telematics.position.received",
    normalized: {
      provider: payload.provider,
      eventId: payload.eventId,
      vehicleId: payload.vehicleId,
      timestamp: payload.timestamp,
      location: { lat: payload.lat, lng: payload.lng },
      speed: payload.speed,
      fuelLevelPercentage: payload.fuelLevelPercentage,
      checkEngineCode: payload.checkEngineCode ?? null,
      engineHours: payload.engineHours ?? null,
      odometer: payload.odometer ?? null,
      geofenceId: payload.geofenceId ?? null,
      ignition: payload.ignition ?? null,
    },
    alerts,
    stored: {
      collection: "telematics-webhooks",
      id: storedRecord.id,
      createdAt: storedRecord.createdAt,
    },
  });
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}