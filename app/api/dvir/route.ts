import { NextResponse } from "next/server";
import { buildCommerceOrderFromDvir, createCommerceOrder } from "@/services/prado-commerce";
import { appendAuditEntry } from "@/services/audit-store";

type DvirApiPayload = {
  id?: string;
  vehicleId?: string;
  driverId?: string;
  mileage?: number;
  inspectionType?: "pre_trip" | "post_trip";
  flaggedItems?: string[];
  obdCode?: string;
  notes?: string;
};

export async function POST(request: Request) {
  let payload: DvirApiPayload;

  try {
    payload = (await request.json()) as DvirApiPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload.id || !payload.vehicleId || !payload.driverId || typeof payload.mileage !== "number" || !payload.inspectionType) {
    return NextResponse.json(
      { error: "Missing required DVIR fields: id, vehicleId, driverId, mileage, inspectionType." },
      { status: 400 },
    );
  }

  const dvirReport = {
    id: payload.id,
    vehicleId: payload.vehicleId,
    driverId: payload.driverId,
    timestamp: new Date().toISOString(),
    type: payload.inspectionType,
    passed: (payload.flaggedItems ?? []).length === 0,
    flaggedItems: payload.flaggedItems ?? [],
    autoOrderPartsTriggered: false,
  };

  const commerceOrder = buildCommerceOrderFromDvir({
    ...dvirReport,
    mileage: payload.mileage,
    inspectionType: payload.inspectionType,
    obdCode: payload.obdCode,
    notes: payload.notes,
  });

  const submission = commerceOrder.lines.length > 0
    ? await createCommerceOrder(commerceOrder)
    : { submitted: false, message: "No orderable parts detected.", order: commerceOrder };

  const storedRecord = await appendAuditEntry("dvir-submissions", "dvir.submitted", {
    dvir: dvirReport,
    commerceOrder,
    submission,
  });

  return NextResponse.json({
    dvir: dvirReport,
    commerceOrder,
    submission,
    stored: {
      collection: "dvir-submissions",
      id: storedRecord.id,
      createdAt: storedRecord.createdAt,
    },
  });
}