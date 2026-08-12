"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type RequisitionRecord = {
  id: string;
  partName: string;
  partNumber: string;
  supplier: string;
  supplierUrl: string | null;
  quantity: number;
  unitCost: number;
  totalCost: number;
  orderedAt: string;
};

type ServiceOrder = {
  id: string;
  vehicle: string;
  issue: string;
  description: string;
  priority: string;
  rawPriority: string;
  status: string;
  rawStatus: string;
  assignedTo: string | null;
  cost: string;
  date: string;
  requisitions: RequisitionRecord[];
};

type VehicleItem = {
  id: string;
  name: string;
};

type PartItem = {
  id: string;
  partName: string;
  partNumber: string;
  supplier: string;
  supplierUrl: string;
  quantity: number;
  unitCost: number;
};

// ─── Supplier URL lookup ──────────────────────────────────────────────────────

const SUPPLIER_URLS: Record<string, string> = {
  "NAPA Auto Parts Commercial": "https://www.napaonline.com/en/commercial",
  "AutoZone Commercial": "https://commercial.autozone.com",
  "O'Reilly Auto Parts": "https://www.oreillyauto.com",
  "FleetPride Commercial": "https://www.fleetpride.com",
  "Amazon Business": "https://business.amazon.com",
  "eBay Motors": "https://www.ebay.com/motors",
  "OEM Manufacturer Direct": "",
};

const APPROVAL_THRESHOLD = 500;

// ─── Helper: extract defects ──────────────────────────────────────────────────

function extractDefectsFromOrder(issue: string, description: string): string[] {
  const rawText = `${issue} ${description}`;
  if (issue.includes("DVIR Defect:")) {
    const afterColon = issue.split("DVIR Defect:")[1];
    if (afterColon) return afterColon.split(",").map((s) => s.trim()).filter(Boolean);
  }
  const knownKeywords = [
    "Brakes", "Hoses", "Tires", "Rims", "Headlights", "Signals",
    "Steering", "Coupling", "Mirrors", "Windshield", "Horn", "Seat Belts",
  ];
  const matched = knownKeywords.filter((k) => rawText.toLowerCase().includes(k.toLowerCase()));
  return matched.length > 0 ? matched : [issue];
}

// ─── Helper: build initial part item from defect keyword ─────────────────────

function buildInitialPart(defect: string, index: number): PartItem {
  const lower = defect.toLowerCase();
  let name = `Replacement Part (${defect})`;
  let cost = 75.0;
  let supplier = "NAPA Auto Parts Commercial";

  if (lower.includes("brake")) { name = "Heavy Duty Brake Pads (Front Axle)"; cost = 120.0; supplier = "NAPA Auto Parts Commercial"; }
  else if (lower.includes("tire")) { name = "Commercial Heavy Duty Tire 225/75R16"; cost = 165.0; supplier = "Amazon Business"; }
  else if (lower.includes("hose") || lower.includes("fluid")) { name = "High Pressure Hydraulic Hose Line"; cost = 45.0; supplier = "AutoZone Commercial"; }
  else if (lower.includes("rim") || lower.includes("wheel")) { name = "Commercial Steel Wheel Rim 16in"; cost = 140.0; supplier = "eBay Motors"; }
  else if (lower.includes("light") || lower.includes("signal")) { name = "LED Headlight / Signal Assembly"; cost = 55.0; supplier = "Amazon Business"; }
  else if (lower.includes("steering")) { name = "Power Steering Pump & Assembly"; cost = 195.0; supplier = "FleetPride Commercial"; }
  else if (lower.includes("mirror") || lower.includes("windshield")) { name = "Side Rearview Mirror / Wiper Set"; cost = 65.0; supplier = "AutoZone Commercial"; }

  return {
    id: `part-${index + 1}-${Date.now()}`,
    partName: name,
    partNumber: `NP-${Math.floor(1000 + Math.random() * 9000)}`,
    supplier,
    supplierUrl: SUPPLIER_URLS[supplier] ?? "",
    quantity: 1,
    unitCost: cost,
  };
}

// ─── Status badge helper ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Completed": "border-emerald-300 bg-emerald-50 text-emerald-800",
    "Parts Ordered": "border-blue-300 bg-blue-50 text-blue-800",
    "In Shop": "border-violet-300 bg-violet-50 text-violet-800",
    "Pending Schedule": "border-amber-300 bg-amber-50 text-amber-900",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${styles[status] ?? "border-slate-300 bg-slate-50 text-slate-700"}`}>
      {status}
    </span>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function MaintenancePage() {
  const [logs, setLogs] = useState<ServiceOrder[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Create Work Order form
  const [formData, setFormData] = useState({
    vehicleName: "",
    title: "",
    description: "",
    priority: "High",
    assignedTo: "Lead Technician Dave",
    cost: "",
  });

  // Parts modal state
  const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);
  const [selectedOrderForParts, setSelectedOrderForParts] = useState<ServiceOrder | null>(null);
  const [isOrderingParts, setIsOrderingParts] = useState(false);
  const [partsSuccessNotice, setPartsSuccessNotice] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);  // upgrade #2
  const [partItems, setPartItems] = useState<PartItem[]>([]);
  const [approvalPending, setApprovalPending] = useState(false); // upgrade #8

  // Inline tech assignment state
  const [editingTechId, setEditingTechId] = useState<string | null>(null);
  const [editingTechValue, setEditingTechValue] = useState("");

  // History accordion state (upgrade #4)
  const [expandedHistory, setExpandedHistory] = useState<Set<string>>(new Set());

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const fetchPortalData = async () => {
    try {
      setIsLoading(true);
      const [maintRes, vehiclesRes] = await Promise.all([
        fetch("/api/maintenance"),
        fetch("/api/telematics/location"),
      ]);

      if (maintRes.ok) {
        const data = await maintRes.json();
        setLogs(data.orders || []);
      }

      if (vehiclesRes.ok) {
        const vData = await vehiclesRes.json();
        if (vData.vehicles && Array.isArray(vData.vehicles)) {
          setVehicles(vData.vehicles);
          if (vData.vehicles.length > 0 && !formData.vehicleName) {
            setFormData((prev) => ({ ...prev, vehicleName: vData.vehicles[0].name }));
          }
        }
      }
    } catch (err) {
      console.error("[MaintenancePage] Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPortalData(); }, []);

  // ─── Create Work Order ──────────────────────────────────────────────────────

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await fetchPortalData();
        setIsModalOpen(false);
        setFormData({ vehicleName: vehicles[0]?.name || "", title: "", description: "", priority: "High", assignedTo: "Lead Technician Dave", cost: "" });
      }
    } catch (err) {
      console.error("[MaintenancePage] Failed to create order:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Toggle work order status (cycles through all states) ──────────────────

  const handleToggleComplete = async (id: string, currentStatus: string) => {
    const nextStatus: Record<string, string> = {
      "Pending Schedule": "IN_PROGRESS",
      "In Shop": "PARTS_ORDERED",
      "Parts Ordered": "COMPLETED",
      "Completed": "OPEN",
    };
    const newStatus = nextStatus[currentStatus] ?? "OPEN";
    try {
      await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      await fetchPortalData();
    } catch (err) {
      console.error("[MaintenancePage] Status update failed:", err);
    }
  };

  // ─── Assign tech inline ────────────────────────────────────────────────────

  const handleAssignTech = async (id: string, tech: string) => {
    const trimmed = tech.trim();
    setEditingTechId(null);
    if (!trimmed) return;
    try {
      await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, assignedTo: trimmed }),
      });
      await fetchPortalData();
    } catch (err) {
      console.error("[MaintenancePage] Tech assignment failed:", err);
    }
  };

  // ─── Delete work order ──────────────────────────────────────────────────────

  const handleDeleteOrder = async (id: string) => {
    try {
      await fetch(`/api/maintenance?id=${id}`, { method: "DELETE" });
      await fetchPortalData();
    } catch (err) {
      console.error("[MaintenancePage] Delete failed:", err);
    }
  };

  // ─── Open Parts Modal ───────────────────────────────────────────────────────

  const handleOpenPartsModal = (order: ServiceOrder) => {
    setSelectedOrderForParts(order);
    setOrderError(null);
    setApprovalPending(false);

    const defectList = extractDefectsFromOrder(order.issue, order.description);
    const initialItems = defectList.map(buildInitialPart);

    setPartItems(
      initialItems.length > 0
        ? initialItems
        : [{ id: `part-1-${Date.now()}`, partName: "Replacement Maintenance Component", partNumber: `NP-${Math.floor(1000 + Math.random() * 9000)}`, supplier: "NAPA Auto Parts Commercial", supplierUrl: SUPPLIER_URLS["NAPA Auto Parts Commercial"], quantity: 1, unitCost: 85.0 }]
    );

    setIsPartsModalOpen(true);
  };

  // ─── Part item CRUD ─────────────────────────────────────────────────────────

  const handleAddPartItem = () => {
    setPartItems((prev) => [
      ...prev,
      { id: `part-${prev.length + 1}-${Date.now()}`, partName: "Additional Replacement Part", partNumber: `NP-${Math.floor(1000 + Math.random() * 9000)}`, supplier: "NAPA Auto Parts Commercial", supplierUrl: SUPPLIER_URLS["NAPA Auto Parts Commercial"], quantity: 1, unitCost: 50.0 },
    ]);
  };

  const handleRemovePartItem = (id: string) => {
    setPartItems((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePartItem = (id: string, field: keyof PartItem, value: unknown) => {
    setPartItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        // Auto-fill supplier URL when supplier changes (upgrade #6)
        if (field === "supplier") {
          updated.supplierUrl = SUPPLIER_URLS[value as string] ?? "";
        }
        return updated;
      })
    );
  };

  // ─── Re-order from last time (upgrade #9) ──────────────────────────────────

  const handleReorderFromLast = () => {
    if (!selectedOrderForParts) return;
    const prevReqs = selectedOrderForParts.requisitions;
    if (!prevReqs || prevReqs.length === 0) return;
    // Take the most recent batch (all items sharing the same orderedAt)
    const lastDate = prevReqs[0].orderedAt;
    const lastBatch = prevReqs.filter((r) => r.orderedAt === lastDate);
    setPartItems(
      lastBatch.map((r, i) => ({
        id: `part-${i + 1}-${Date.now()}`,
        partName: r.partName,
        partNumber: r.partNumber,
        supplier: r.supplier,
        supplierUrl: r.supplierUrl ?? SUPPLIER_URLS[r.supplier] ?? "",
        quantity: r.quantity,
        unitCost: r.unitCost,
      }))
    );
  };

  // ─── Confirm Order Parts ────────────────────────────────────────────────────

  const handleConfirmOrderParts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForParts || partItems.length === 0) return;

    const totalPartsCost = partItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

    // Upgrade #8: High-cost approval gate
    if (totalPartsCost >= APPROVAL_THRESHOLD && !approvalPending) {
      setApprovalPending(true);
      return;
    }

    setOrderError(null);

    try {
      setIsOrderingParts(true);
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrderForParts.id,
          additionalCost: totalPartsCost,
          vehicleName: selectedOrderForParts.vehicle,
          workOrderTitle: selectedOrderForParts.issue,
          parts: partItems.map((p) => ({
            partName: p.partName,
            partNumber: p.partNumber,
            supplier: p.supplier,
            supplierUrl: p.supplierUrl || null,
            quantity: p.quantity,
            unitCost: p.unitCost,
          })),
        }),
      });

      if (res.ok) {
        setPartsSuccessNotice(
          `✅ Ordered ${partItems.length} part${partItems.length === 1 ? "" : "s"} ($${totalPartsCost.toFixed(2)} total) — expense attached to ${selectedOrderForParts.vehicle} & status updated.`
        );
        setTimeout(() => setPartsSuccessNotice(null), 6000);
        await fetchPortalData();
        setIsPartsModalOpen(false);
        setApprovalPending(false);
      } else {
        // Upgrade #2: User-facing error handling
        const errData = await res.json().catch(() => ({}));
        setOrderError(errData?.error ?? "Failed to submit parts order. Please try again.");
      }
    } catch (err) {
      console.error("[MaintenancePage] Order parts error:", err);
      setOrderError("A network error occurred. Please check your connection and try again.");
    } finally {
      setIsOrderingParts(false);
    }
  };

  // ─── Computed values for Budget Tracker (upgrade #7) ───────────────────────

  const allReqs = logs.flatMap((l) => l.requisitions ?? []);
  const totalPartsSpend = allReqs.reduce((s, r) => s + r.totalCost, 0);

  const now = new Date();
  const mtdReqs = allReqs.filter((r) => {
    const d = new Date(r.orderedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const mtdSpend = mtdReqs.reduce((s, r) => s + r.totalCost, 0);

  const supplierSpend: Record<string, number> = {};
  allReqs.forEach((r) => { supplierSpend[r.supplier] = (supplierSpend[r.supplier] ?? 0) + r.totalCost; });
  const topSupplier = Object.entries(supplierSpend).sort((a, b) => b[1] - a[1])[0];

  const totalPartsCostModal = partItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const hasPrevReqs = (selectedOrderForParts?.requisitions?.length ?? 0) > 0;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Wrench className="text-amber-500" size={22} />
            Preventive Maintenance &amp; OBD Diagnostics
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track active service tickets, auto-escalated DVIR defects, and parts ordering in Supabase.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button type="button" onClick={fetchPortalData}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <RefreshCw size={14} className={isLoading ? "animate-spin text-amber-500" : "text-slate-400"} />
            Refresh
          </button>
          <button type="button" onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:bg-amber-500 transition-all active:scale-98">
            <Plus size={16} /> Create Work Order
          </button>
        </div>
      </div>

      {/* Success toast */}
      {partsSuccessNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{partsSuccessNotice}</span>
        </div>
      )}

      {/* Work Orders Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <Wrench size={18} className="text-amber-500" /> Active Maintenance Work Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Service requests logged by mechanics or escalated from driver DVIR inspections.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
              <tr>
                <th className="p-4">Vehicle Unit</th>
                <th className="p-4">Issue Description</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Assigned Tech</th>
                <th className="p-4">Total Cost</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400">
                  <RefreshCw className="animate-spin mx-auto mb-2 text-amber-500" size={20} />
                  Loading maintenance logs...
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400">
                  No active maintenance orders found. Click &quot;Create Work Order&quot; to create one.
                </td></tr>
              ) : (
                logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{log.vehicle}</td>
                      <td className="p-4 max-w-xs">
                        <p className="font-semibold text-slate-900">{log.issue}</p>
                        {log.description && <p className="text-[11px] text-slate-500 line-clamp-1">{log.description}</p>}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${log.priority === "High" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-900"}`}>
                          {log.priority === "High" && <AlertTriangle size={11} />}
                          {log.priority}
                        </span>
                      </td>
                       <td className="p-4">
                         {editingTechId === log.id ? (
                           <input
                             autoFocus
                             type="text"
                             value={editingTechValue}
                             onChange={(e) => setEditingTechValue(e.target.value)}
                             onBlur={() => handleAssignTech(log.id, editingTechValue)}
                             onKeyDown={(e) => {
                               if (e.key === "Enter") handleAssignTech(log.id, editingTechValue);
                               if (e.key === "Escape") setEditingTechId(null);
                             }}
                             placeholder="Assign technician..."
                             className="w-36 rounded-lg border border-amber-400 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 outline-none ring-1 ring-amber-300"
                           />
                         ) : (
                           <button
                             type="button"
                             onClick={() => { setEditingTechId(log.id); setEditingTechValue(log.assignedTo ?? ""); }}
                             className={`text-xs font-medium text-left transition-colors hover:text-amber-700 ${
                               log.assignedTo ? "text-slate-800" : "text-slate-400 italic"
                             }`}
                             title="Click to assign technician"
                           >
                             {log.assignedTo ?? "Unassigned"}
                           </button>
                         )}
                       </td>
                      <td className="p-4 font-mono font-bold text-slate-800">{log.cost}</td>
                      <td className="p-4">
                        <button type="button" onClick={() => handleToggleComplete(log.id, log.status)}
                          className="hover:opacity-80 transition-opacity" title="Click to advance status">
                          <StatusBadge status={log.status} />
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Parts history toggle (upgrade #4) */}
                          {log.requisitions.length > 0 && (
                            <button type="button"
                              onClick={() => setExpandedHistory((prev) => {
                                const next = new Set(prev);
                                next.has(log.id) ? next.delete(log.id) : next.add(log.id);
                                return next;
                              })}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-2xs"
                              title="View parts history">
                              <Package size={12} />
                              {log.requisitions.length}
                              {expandedHistory.has(log.id) ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            </button>
                          )}

                          <button type="button" onClick={() => handleOpenPartsModal(log)}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-400 transition-colors shadow-2xs active:scale-98">
                            <ShoppingBag size={12} /> Order Parts
                          </button>

                          <button type="button" onClick={() => handleDeleteOrder(log.id)}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors" title="Delete Ticket">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Parts History Accordion Row (upgrade #4) */}
                    {expandedHistory.has(log.id) && log.requisitions.length > 0 && (
                      <tr>
                        <td colSpan={7} className="bg-blue-50/50 border-t border-b border-blue-100 px-6 py-4">
                          <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <Package size={13} /> Parts Order History — {log.vehicle}
                          </p>
                          <div className="space-y-2">
                            {/* Group by orderedAt date */}
                            {Array.from(new Set(log.requisitions.map((r) => r.orderedAt))).map((date) => {
                              const batch = log.requisitions.filter((r) => r.orderedAt === date);
                              const batchTotal = batch.reduce((s, r) => s + r.totalCost, 0);
                              return (
                                <div key={date} className="rounded-xl border border-blue-200 bg-white p-3 shadow-2xs">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                      <Calendar size={11} className="text-blue-400" /> {date}
                                    </span>
                                    <span className="text-[11px] font-mono font-bold text-slate-800">${batchTotal.toFixed(2)}</span>
                                  </div>
                                  <div className="space-y-1">
                                    {batch.map((r) => (
                                      <div key={r.id} className="flex items-center justify-between text-[11px] text-slate-600">
                                        <span className="font-semibold">{r.partName}</span>
                                        <div className="flex items-center gap-3">
                                          <span className="font-mono text-slate-400">{r.partNumber}</span>
                                          {r.supplierUrl ? (
                                            <a href={r.supplierUrl} target="_blank" rel="noopener noreferrer"
                                              className="flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-medium">
                                              {r.supplier} <ExternalLink size={10} />
                                            </a>
                                          ) : (
                                            <span>{r.supplier}</span>
                                          )}
                                          <span>×{r.quantity}</span>
                                          <span className="font-mono font-bold text-slate-800">${r.totalCost.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Budget Tracker Card (upgrade #7) */}
      {allReqs.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp size={18} className="text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-slate-950">Parts &amp; Spend Tracker</h2>
              <p className="text-xs text-slate-500 mt-0.5">Aggregated parts spend across all active work orders.</p>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Spend */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">All-Time Parts Spend</p>
              <p className="text-2xl font-extrabold font-mono text-slate-900">${totalPartsSpend.toFixed(2)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{allReqs.length} line item{allReqs.length === 1 ? "" : "s"} total</p>
            </div>
            {/* MTD Spend */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">Month-to-Date Spend</p>
              <p className="text-2xl font-extrabold font-mono text-amber-900">${mtdSpend.toFixed(2)}</p>
              <p className="text-[11px] text-amber-600 mt-0.5">{mtdReqs.length} item{mtdReqs.length === 1 ? "" : "s"} this month</p>
            </div>
            {/* Top Supplier */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-1">Top Supplier</p>
              {topSupplier ? (
                <>
                  <p className="text-sm font-extrabold text-blue-900 leading-tight">{topSupplier[0]}</p>
                  <p className="text-[11px] font-mono font-bold text-blue-700 mt-0.5">${topSupplier[1].toFixed(2)} total</p>
                  {SUPPLIER_URLS[topSupplier[0]] && (
                    <a href={SUPPLIER_URLS[topSupplier[0]]} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 mt-1">
                      Visit supplier <ExternalLink size={10} />
                    </a>
                  )}
                </>
              ) : (
                <p className="text-sm text-blue-400">No data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
        <span>Maintenance alerts and work orders automatically sync from driver DVIR defect escalations.</span>
      </div>

      {/* ─── Create Work Order Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md my-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-950">
                <Wrench size={20} className="text-amber-500" />
                Create Maintenance Work Order
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-600">Select Vehicle</label>
                <select value={formData.vehicleName} onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-amber-400">
                  {vehicles.map((v) => <option key={v.id} value={v.name}>{v.name}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Issue Title / Diagnostic Code</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Brake Pad Diagnostics & Replacement"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none focus:border-amber-400" />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Detailed Description</label>
                <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Front brake wear above threshold, replace rotors and pads..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-amber-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-600">Priority Level</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-amber-400">
                    <option value="High">High Priority</option>
                    <option value="Routine">Routine Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-600">Estimated Cost ($)</label>
                  <input type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="e.g. 450.00"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 outline-none focus:border-amber-400" />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Assigned Mechanic / Tech</label>
                <input type="text" value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="e.g. Lead Technician Dave"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 outline-none focus:border-amber-400" />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" disabled={isSaving}
                  className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-md disabled:opacity-50">
                  {isSaving ? "Saving..." : "Create Work Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Order Parts Requisition Modal ─── */}
      {isPartsModalOpen && selectedOrderForParts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl my-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 text-base font-bold text-slate-950">
                  <ShoppingBag size={20} className="text-amber-500" />
                  Order Replacement Parts ({partItems.length} {partItems.length === 1 ? "Item" : "Items"})
                </div>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  Work Order: {selectedOrderForParts.issue} ({selectedOrderForParts.vehicle})
                </p>
              </div>
              <button type="button" onClick={() => { setIsPartsModalOpen(false); setApprovalPending(false); setOrderError(null); }}
                className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            {/* Error banner (upgrade #2) */}
            {orderError && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
                <AlertTriangle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                <span>{orderError}</span>
              </div>
            )}

            {/* Approval gate warning (upgrade #8) */}
            {approvalPending && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-xs space-y-2">
                <p className="font-bold text-orange-900 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-orange-500" />
                  High-Cost Order — Confirmation Required
                </p>
                <p className="text-orange-800 leading-relaxed">
                  This requisition totals <span className="font-mono font-extrabold">${totalPartsCostModal.toFixed(2)}</span>, which exceeds the ${APPROVAL_THRESHOLD} threshold. Click &ldquo;Confirm Order&rdquo; again to approve and submit.
                </p>
                <button type="button" onClick={() => setApprovalPending(false)}
                  className="text-[11px] font-semibold text-orange-600 hover:text-orange-800 underline">
                  ← Go back and edit
                </button>
              </div>
            )}



            {/* Reorder suggestion (upgrade #9) */}
            {hasPrevReqs && (
              <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs">
                <span className="font-semibold text-blue-800 flex items-center gap-1.5">
                  <RotateCcw size={13} className="text-blue-500" />
                  Previous order found for this vehicle ({selectedOrderForParts.requisitions[0].orderedAt})
                </span>
                <button type="button" onClick={handleReorderFromLast}
                  className="ml-3 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700 transition-colors shrink-0">
                  Re-order
                </button>
              </div>
            )}

            <form onSubmit={handleConfirmOrderParts} className="space-y-4 text-xs">
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {partItems.map((item, index) => (
                  <div key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3 relative transition-all">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="grid size-5 place-items-center rounded-full bg-amber-400 text-[10px] font-extrabold text-slate-950">{index + 1}</span>
                        Part Line Item #{index + 1}
                      </span>
                      {partItems.length > 1 && (
                        <button type="button" onClick={() => handleRemovePartItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors" title="Remove Part Item">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Part Description / Component Name</label>
                      <input type="text" required value={item.partName}
                        onChange={(e) => handleUpdatePartItem(item.id, "partName", e.target.value)}
                        placeholder="e.g. Heavy Duty Brake Pads (Front Set)"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-amber-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="mb-1 block font-semibold text-slate-700">Part SKU / Number</label>
                        <input type="text" required value={item.partNumber}
                          onChange={(e) => handleUpdatePartItem(item.id, "partNumber", e.target.value)}
                          placeholder="e.g. NAPA-BP-4902"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-slate-900 outline-none focus:border-amber-400" />
                      </div>

                      <div>
                        <label className="mb-1 block font-semibold text-slate-700">Commercial Supplier</label>
                        <select value={item.supplier}
                          onChange={(e) => handleUpdatePartItem(item.id, "supplier", e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-800 outline-none focus:border-amber-400">
                          {Object.keys(SUPPLIER_URLS).map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Supplier URL chip (upgrade #6) */}
                    {item.supplierUrl && (
                      <a href={item.supplierUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                        <ExternalLink size={11} /> Purchase from {item.supplier}
                      </a>
                    )}

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="mb-1 block font-semibold text-slate-700">Quantity</label>
                        <input type="number" min="1" required value={item.quantity}
                          onChange={(e) => handleUpdatePartItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-amber-400" />
                      </div>
                      <div>
                        <label className="mb-1 block font-semibold text-slate-700">Unit Price ($)</label>
                        <input type="number" step="0.01" required value={item.unitCost}
                          onChange={(e) => handleUpdatePartItem(item.id, "unitCost", parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-amber-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Part */}
              <div className="flex justify-start pt-1">
                <button type="button" onClick={handleAddPartItem}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100 transition-colors shadow-2xs">
                  <Plus size={15} /> Add Another Replacement Part
                </button>
              </div>

              {/* Total footer */}
              <div className={`rounded-xl border p-3.5 text-xs flex items-center justify-between font-bold shadow-2xs transition-colors ${totalPartsCostModal >= APPROVAL_THRESHOLD ? "border-orange-300 bg-orange-50 text-orange-950" : "border-amber-200 bg-amber-50/90 text-amber-950"}`}>
                <span>
                  Total Combined Parts Expense ({partItems.length} {partItems.length === 1 ? "Item" : "Items"}):
                  {totalPartsCostModal >= APPROVAL_THRESHOLD && (
                    <span className="ml-2 font-bold text-orange-600">⚠ Approval required</span>
                  )}
                </span>
                <span className="font-mono text-base font-extrabold">
                  ${totalPartsCostModal.toFixed(2)}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => { setIsPartsModalOpen(false); setApprovalPending(false); setOrderError(null); }}
                  disabled={isOrderingParts}
                  className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isOrderingParts}
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md disabled:opacity-50 flex items-center gap-2 transition-colors ${approvalPending ? "bg-orange-400 hover:bg-orange-500" : "bg-amber-400 hover:bg-amber-500"}`}>
                  <ShoppingBag size={15} />
                  {isOrderingParts
                    ? "Processing Order..."
                    : approvalPending
                    ? `Confirm Order ($${totalPartsCostModal.toFixed(2)})`
                    : `Confirm Order (${partItems.length} Parts)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}