import type { DVIRReport } from "@/types/fleet";

export type OBDLookup = {
  code: string;
  description: string;
  recommendedParts: string[];
  autoOrder: boolean;
};

export type CommerceOrderLine = {
  sku: string;
  name: string;
  quantity: number;
  source: string;
};

export type CommerceOrderDraft = {
  vehicleId: string;
  driverId: string;
  dvirId: string;
  status: "ready" | "review_required";
  reason: string;
  lines: CommerceOrderLine[];
  externalReference: string;
};

export type CommerceOrderSubmission = {
  submitted: boolean;
  message: string;
  order: CommerceOrderDraft;
  payload?: Record<string, unknown>;
};

export type DvirCommerceInput = Pick<DVIRReport, "id" | "vehicleId" | "driverId" | "flaggedItems" | "autoOrderPartsTriggered"> & {
  mileage: number;
  inspectionType: DVIRReport["type"];
  obdCode?: string;
  notes?: string;
};

const OBD_PART_LOOKUP: Record<string, OBDLookup> = {
  P0300: {
    code: "P0300",
    description: "Random/Multiple Cylinder Misfire Detected",
    recommendedParts: ["spark-plug-set", "ignition-coil-set"],
    autoOrder: true,
  },
  P0171: {
    code: "P0171",
    description: "System Too Lean (Bank 1)",
    recommendedParts: ["air-filter", "mass-air-flow-cleaner"],
    autoOrder: false,
  },
  P0420: {
    code: "P0420",
    description: "Catalyst System Efficiency Below Threshold",
    recommendedParts: ["oxygen-sensor", "catalytic-converter-kit"],
    autoOrder: false,
  },
};

const DVIR_ITEM_TO_PARTS: Record<string, CommerceOrderLine[]> = {
  brakes: [{ sku: "brake-pad-kit", name: "Brake Pad Kit", quantity: 1, source: "DVIR" }],
  tires: [{ sku: "tire-pressure-repair-kit", name: "Tire Pressure Repair Kit", quantity: 1, source: "DVIR" }],
  lights: [{ sku: "tail-light-assembly", name: "Tail Light Assembly", quantity: 1, source: "DVIR" }],
  oil: [{ sku: "oil-filter-and-service-kit", name: "Oil Filter and Service Kit", quantity: 1, source: "DVIR" }],
  coolant: [{ sku: "coolant-service-kit", name: "Coolant Service Kit", quantity: 1, source: "DVIR" }],
  hitch: [{ sku: "hitch-safety-chain-kit", name: "Hitch and Safety Chain Kit", quantity: 1, source: "DVIR" }],
  obd: [{ sku: "diagnostic-scan-session", name: "Diagnostic Scan Session", quantity: 1, source: "DVIR" }],
};

function mapObdCodeToParts(obdCode?: string): CommerceOrderLine[] {
  if (!obdCode) {
    return [];
  }

  const normalizedCode = obdCode.trim().toUpperCase();
  const lookup = OBD_PART_LOOKUP[normalizedCode];

  if (!lookup) {
    return [{ sku: "diagnostic-review-required", name: `Review ${normalizedCode}`, quantity: 1, source: "OBD" }];
  }

  return lookup.recommendedParts.map((partSku) => ({
    sku: partSku,
    name: partSku.replaceAll("-", " "),
    quantity: 1,
    source: `OBD:${lookup.code}`,
  }));
}

function dedupeLines(lines: CommerceOrderLine[]): CommerceOrderLine[] {
  const lineMap = new Map<string, CommerceOrderLine>();

  for (const line of lines) {
    const existing = lineMap.get(line.sku);
    if (existing) {
      lineMap.set(line.sku, { ...existing, quantity: existing.quantity + line.quantity });
      continue;
    }

    lineMap.set(line.sku, line);
  }

  return Array.from(lineMap.values());
}

export function buildCommerceOrderFromDvir(input: DvirCommerceInput): CommerceOrderDraft {
  const flaggedParts = input.flaggedItems.flatMap((flaggedItem) => DVIR_ITEM_TO_PARTS[flaggedItem] ?? []);
  const obdParts = mapObdCodeToParts(input.obdCode);
  const lines = dedupeLines([...flaggedParts, ...obdParts]);
  const status: CommerceOrderDraft["status"] = lines.length > 0 ? "ready" : "review_required";

  const reason = lines.length > 0
    ? `DVIR ${input.inspectionType} inspection flagged ${input.flaggedItems.length} item(s)${input.obdCode ? ` and OBD code ${input.obdCode}` : ""}.`
    : "No orderable defects were identified.";

  return {
    vehicleId: input.vehicleId,
    driverId: input.driverId,
    dvirId: input.id,
    status,
    reason,
    lines,
    externalReference: `DVIR-${input.id}`,
  };
}

export function getObdLookup(obdCode: string): OBDLookup | undefined {
  return OBD_PART_LOOKUP[obdCode.trim().toUpperCase()];
}

export function shouldAutoOrderCommerceParts(input: DvirCommerceInput): boolean {
  return buildCommerceOrderFromDvir(input).status === "ready";
}

export async function createCommerceOrder(order: CommerceOrderDraft): Promise<CommerceOrderSubmission> {
  const baseUrl = process.env.PRADO_COMMERCE_ORDER_API_URL ?? process.env.PRADO_COMMERCE_API_URL;

  if (!baseUrl) {
    return {
      submitted: false,
      message: "Prado Commerce API is not configured. Queued a local order payload.",
      order,
    };
  }

  const { status: _orderStatus, ...orderPayload } = order;

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/orders`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.PRADO_COMMERCE_API_KEY ? { authorization: `Bearer ${process.env.PRADO_COMMERCE_API_KEY}` } : {}),
      "idempotency-key": order.externalReference,
    },
    body: JSON.stringify({
      sourceSystem: "prado-fleet",
      orderType: "maintenance_parts",
      status: "open",
      reference: order.externalReference,
      ...orderPayload,
    }),
  });

  if (!response.ok) {
    throw new Error(`Prado Commerce order submission failed with status ${response.status}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;

  return {
    submitted: true,
    message: "Commerce order created successfully.",
    payload,
    order,
  };
}