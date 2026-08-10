import { NextResponse } from "next/server";
import { appendAuditEntry } from "@/services/audit-store";

type FuelCardWebhookPayload = {
  provider?: string;
  eventId?: string;
  transactionId?: string;
  vehicleId?: string;
  driverId?: string;
  cardLast4?: string;
  merchantName?: string;
  gallons?: number;
  amount?: number;
  odometer?: number;
  transactionTime?: string;
  latitude?: number;
  longitude?: number;
};

export async function POST(request: Request) {
  let payload: FuelCardWebhookPayload;

  try {
    payload = (await request.json()) as FuelCardWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const requiredFields = ["provider", "eventId", "transactionId", "vehicleId", "cardLast4", "merchantName", "gallons", "amount", "transactionTime"] as const;
  const missingFields = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: "Missing required fuel card webhook fields.", missingFields },
      { status: 400 },
    );
  }

  const fraudFlags: string[] = [];

  if (typeof payload.amount === "number" && payload.amount > 250) {
    fraudFlags.push("high_amount");
  }

  if (typeof payload.gallons === "number" && payload.gallons > 60) {
    fraudFlags.push("high_fuel_volume");
  }

  if (typeof payload.latitude === "number" && typeof payload.longitude === "number" && Math.abs(payload.latitude) > 90) {
    fraudFlags.push("invalid_location");
  }

  const storedRecord = await appendAuditEntry("fuel-card-webhooks", "fuel_card.transaction.received", {
    normalized: {
      provider: payload.provider,
      eventId: payload.eventId,
      transactionId: payload.transactionId,
      vehicleId: payload.vehicleId,
      driverId: payload.driverId ?? null,
      cardLast4: payload.cardLast4,
      merchantName: payload.merchantName,
      gallons: payload.gallons,
      amount: payload.amount,
      odometer: payload.odometer ?? null,
      transactionTime: payload.transactionTime,
      location: typeof payload.latitude === "number" && typeof payload.longitude === "number"
        ? { latitude: payload.latitude, longitude: payload.longitude }
        : null,
    },
    fraudFlags,
  }, payload.provider ?? "fuel-card-provider");

  return NextResponse.json({
    ok: true,
    eventType: "fuel_card.transaction.received",
    normalized: {
      provider: payload.provider,
      eventId: payload.eventId,
      transactionId: payload.transactionId,
      vehicleId: payload.vehicleId,
      driverId: payload.driverId ?? null,
      merchantName: payload.merchantName,
      gallons: payload.gallons,
      amount: payload.amount,
      odometer: payload.odometer ?? null,
      transactionTime: payload.transactionTime,
      location: typeof payload.latitude === "number" && typeof payload.longitude === "number"
        ? { latitude: payload.latitude, longitude: payload.longitude }
        : null,
    },
    fraudFlags,
    stored: {
      collection: "fuel-card-webhooks",
      id: storedRecord.id,
      createdAt: storedRecord.createdAt,
    },
  });
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}