"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Send,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

interface DVIRItem {
  id: string;
  label: string;
  category: "safety" | "mechanical" | "fluids";
}

const INSPECTION_ITEMS: DVIRItem[] = [
  { id: "brakes", label: "Service & Parking Brakes", category: "safety" },
  { id: "tires", label: "Tire Pressure & Tread Depth", category: "safety" },
  { id: "lights", label: "Headlights, Signals & Tail Lights", category: "safety" },
  { id: "oil", label: "Engine Oil Level", category: "fluids" },
  { id: "coolant", label: "Radiator Coolant Level", category: "fluids" },
  { id: "obd", label: "Dashboard Engine/OBD Fault Light", category: "mechanical" },
  { id: "hitch", label: "Trailer Hitch & Safety Chains", category: "mechanical" },
];

export default function DVIRForm() {
  const [vehicleId, setVehicleId] = useState("truck-04");
  const [inspectionType, setInspectionType] = useState<"pre_trip" | "post_trip">("pre_trip");
  const [mileage, setMileage] = useState("");
  const [statuses, setStatuses] = useState<Record<string, "pass" | "fail">>({});
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [commerceResult, setCommerceResult] = useState<{ submitted: boolean; message: string } | null>(null);

  const handleStatusChange = (id: string, status: "pass" | "fail") => {
    setStatuses((previous) => ({ ...previous, [id]: status }));
  };

  const failedCount = Object.values(statuses).filter((status) => status === "fail").length;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmissionError(null);

    void (async () => {
      try {
        const response = await fetch("/api/dvir", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            id: `dvir-${Date.now()}`,
            vehicleId,
            driverId: "driver-unknown",
            mileage: Number(mileage),
            inspectionType,
            flaggedItems: Object.entries(statuses)
              .filter(([, status]) => status === "fail")
              .map(([itemId]) => itemId),
            obdCode: statuses.obd === "fail" ? "P0300" : undefined,
            notes,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? "Failed to submit DVIR.");
        }

        const payload = (await response.json()) as { submission?: { submitted: boolean; message: string } };
        setCommerceResult(payload.submission ?? { submitted: false, message: "DVIR completed." });
        setSubmitted(true);
      } catch (error) {
        setSubmissionError(error instanceof Error ? error.message : "Failed to submit DVIR.");
      }
    })();
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm shadow-slate-200/50">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            failedCount > 0 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
          }`}
        >
          {failedCount > 0 ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}
        </div>
        <h3 className="text-xl font-bold text-slate-900">DVIR Submitted</h3>
        <p className="text-sm text-slate-600">
          {failedCount > 0
            ? `${failedCount} defect(s) logged. Fleet dispatch and Prado Commerce have been notified for auto-sourcing parts.`
            : "Vehicle passed inspection and is cleared for road operations."}
        </p>
        {commerceResult ? <p className="text-xs text-slate-500">{commerceResult.message}</p> : null}
        <button
          onClick={() => {
            setSubmitted(false);
            setStatuses({});
            setNotes("");
            setCommerceResult(null);
          }}
          className="w-full rounded-xl bg-amber-400 py-3 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-500"
        >
          New Inspection
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
          <Truck size={14} /> Mobile Driver Inspection
        </div>
        <h2 className="text-xl font-bold text-slate-900">Daily Vehicle Inspection (DVIR)</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Vehicle</label>
            <select
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-400"
            >
              <option value="truck-01">Truck 01 - Ford F-150</option>
              <option value="truck-04">Truck 04 - Ford F-250</option>
              <option value="truck-09">Truck 09 - Ram 3500</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Type</label>
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setInspectionType("pre_trip")}
                className={`rounded-lg py-2 text-xs font-medium transition-colors ${
                  inspectionType === "pre_trip"
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Pre-Trip
              </button>
              <button
                type="button"
                onClick={() => setInspectionType("post_trip")}
                className={`rounded-lg py-2 text-xs font-medium transition-colors ${
                  inspectionType === "post_trip"
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Post-Trip
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Current Odometer (Miles)</label>
          <input
            type="number"
            placeholder="e.g., 84,210"
            value={mileage}
            onChange={(event) => setMileage(event.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-500">Inspection Checklist</label>
          {INSPECTION_ITEMS.map((item) => {
            const status = statuses[item.id];

            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <span className="text-sm font-medium text-slate-800">{item.label}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, "pass")}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      status === "pass"
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, "fail")}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      status === "fail"
                        ? "border-rose-500 bg-rose-500 text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    Defect
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {failedCount > 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">
            <Wrench size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">{failedCount} Defect(s) Flagged</p>
              <p className="mt-0.5 text-amber-700/80">
                Submitting will auto-generate a maintenance ticket for Prado Jobs and check inventory in Prado Commerce.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">All Systems Ready</p>
              <p className="mt-0.5 text-emerald-700/80">
                Keep the inspection moving with large touch targets and a quick sign-off flow.
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Driver Remarks / Specific Issues</label>
          <textarea
            rows={3}
            placeholder="Describe any mechanical noises, leaks, or tool damage..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 text-sm font-semibold text-slate-950 shadow-sm shadow-amber-200 transition-colors hover:bg-amber-500"
        >
          <Send size={16} /> Sign & Submit DVIR Report
        </button>

        {submissionError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {submissionError}
          </div>
        ) : null}
      </form>
    </div>
  );
}