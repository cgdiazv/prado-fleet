"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

type ServiceOrder = {
  id: string;
  vehicle: string;
  issue: string;
  description: string;
  priority: string;
  rawPriority: string;
  status: string;
  rawStatus: string;
  assignedTo: string;
  cost: string;
  date: string;
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
  quantity: number;
  unitCost: number;
};

function extractDefectsFromOrder(issue: string, description: string): string[] {
  const rawText = `${issue} ${description}`;
  if (issue.includes("DVIR Defect:")) {
    const afterColon = issue.split("DVIR Defect:")[1];
    if (afterColon) {
      return afterColon.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  const knownKeywords = [
    "Brakes", "Hoses", "Tires", "Rims", "Headlights", "Signals",
    "Steering", "Coupling", "Mirrors", "Windshield", "Horn", "Seat Belts"
  ];

  const matched = knownKeywords.filter((k) => rawText.toLowerCase().includes(k.toLowerCase()));
  return matched.length > 0 ? matched : [issue];
}

export default function MaintenancePage() {
  const [logs, setLogs] = useState<ServiceOrder[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Form State
  const [formData, setFormData] = useState({
    vehicleName: "",
    title: "",
    description: "",
    priority: "High",
    assignedTo: "Lead Technician Dave",
    cost: "",
  });

  // Order Parts Modal State (Multi-Item Requisition)
  const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);
  const [selectedOrderForParts, setSelectedOrderForParts] = useState<ServiceOrder | null>(null);
  const [isOrderingParts, setIsOrderingParts] = useState(false);
  const [partsSuccessNotice, setPartsSuccessNotice] = useState<string | null>(null);
  const [partItems, setPartItems] = useState<PartItem[]>([]);

  const handleOpenPartsModal = (order: ServiceOrder) => {
    setSelectedOrderForParts(order);
    const defectList = extractDefectsFromOrder(order.issue, order.description);

    const initialItems: PartItem[] = defectList.map((defect, index) => {
      const lower = defect.toLowerCase();
      let name = `Replacement Part (${defect})`;
      let cost = 75.0;
      let supplier = "NAPA Auto Parts Commercial";

      if (lower.includes("brake")) {
        name = "Heavy Duty Brake Pads (Front Axle)";
        cost = 120.0;
        supplier = "NAPA Auto Parts Commercial";
      } else if (lower.includes("tire")) {
        name = "Commercial Heavy Duty Tire 225/75R16";
        cost = 165.0;
        supplier = "Amazon Business";
      } else if (lower.includes("hose") || lower.includes("fluid")) {
        name = "High Pressure Hydraulic Hose Line";
        cost = 45.0;
        supplier = "AutoZone Commercial";
      } else if (lower.includes("rim") || lower.includes("wheel")) {
        name = "Commercial Steel Wheel Rim 16in";
        cost = 140.0;
        supplier = "eBay Motors";
      } else if (lower.includes("light") || lower.includes("signal")) {
        name = "LED Headlight / Signal Assembly";
        cost = 55.0;
        supplier = "Amazon Business";
      } else if (lower.includes("steering")) {
        name = "Power Steering Pump & Assembly";
        cost = 195.0;
        supplier = "FleetPride Commercial";
      } else if (lower.includes("mirror") || lower.includes("windshield")) {
        name = "Side Rearview Mirror / Wiper Set";
        cost = 65.0;
        supplier = "AutoZone Commercial";
      }

      return {
        id: `part-${index + 1}-${Date.now()}`,
        partName: name,
        partNumber: `NP-${Math.floor(1000 + Math.random() * 9000)}`,
        supplier,
        quantity: 1,
        unitCost: cost,
      };
    });

    setPartItems(
      initialItems.length > 0
        ? initialItems
        : [
            {
              id: `part-1-${Date.now()}`,
              partName: "Replacement Maintenance Component",
              partNumber: `NP-${Math.floor(1000 + Math.random() * 9000)}`,
              supplier: "NAPA Auto Parts Commercial",
              quantity: 1,
              unitCost: 85.0,
            },
          ]
    );

    setIsPartsModalOpen(true);
  };

  const handleAddPartItem = () => {
    setPartItems((prev) => [
      ...prev,
      {
        id: `part-${prev.length + 1}-${Date.now()}`,
        partName: "Additional Replacement Part",
        partNumber: `NP-${Math.floor(1000 + Math.random() * 9000)}`,
        supplier: "NAPA Auto Parts Commercial",
        quantity: 1,
        unitCost: 50.0,
      },
    ]);
  };

  const handleRemovePartItem = (id: string) => {
    setPartItems((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePartItem = (id: string, field: keyof PartItem, value: any) => {
    setPartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleConfirmOrderParts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForParts || partItems.length === 0) return;

    const totalPartsCost = partItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

    try {
      setIsOrderingParts(true);
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrderForParts.id,
          additionalCost: totalPartsCost,
        }),
      });

      if (res.ok) {
        setPartsSuccessNotice(
          `Ordered ${partItems.length} parts items ($${totalPartsCost.toFixed(2)} total). Expense attached to ${selectedOrderForParts.vehicle}!`
        );
        setTimeout(() => setPartsSuccessNotice(null), 5000);
        await fetchPortalData();
        setIsPartsModalOpen(false);
      }
    } catch (err) {
      console.error("[MaintenancePage] Order parts error:", err);
    } finally {
      setIsOrderingParts(false);
    }
  };

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

  useEffect(() => {
    fetchPortalData();
  }, []);

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
        setFormData({
          vehicleName: vehicles[0]?.name || "",
          title: "",
          description: "",
          priority: "High",
          assignedTo: "Lead Technician Dave",
          cost: "",
        });
      }
    } catch (err) {
      console.error("[MaintenancePage] Failed to create order:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleComplete = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Completed" ? "OPEN" : "COMPLETED";
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

  const handleDeleteOrder = async (id: string) => {
    try {
      await fetch(`/api/maintenance?id=${id}`, {
        method: "DELETE",
      });
      await fetchPortalData();
    } catch (err) {
      console.error("[MaintenancePage] Delete failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Wrench className="text-amber-500" size={22} />
            Preventive Maintenance & OBD Diagnostics
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track active service tickets, auto-escalated DVIR defects, and parts ordering in Supabase.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={fetchPortalData}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-amber-500" : "text-slate-400"} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:bg-amber-500 transition-all active:scale-98"
          >
            <Plus size={16} />
            Create Work Order
          </button>
        </div>
      </div>

      {partsSuccessNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{partsSuccessNotice}</span>
        </div>
      )}

      {/* Active Service Orders Table */}
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
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw className="animate-spin mx-auto mb-2 text-amber-500" size={20} />
                    Loading maintenance logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No active maintenance orders found. Click &quot;New Work Order&quot; to create one.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{log.vehicle}</td>
                    <td className="p-4 max-w-xs">
                      <p className="font-semibold text-slate-900">{log.issue}</p>
                      {log.description && <p className="text-[11px] text-slate-500 line-clamp-1">{log.description}</p>}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          log.priority === "High"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {log.priority === "High" && <AlertTriangle size={11} />}
                        {log.priority}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-800">{log.assignedTo}</td>
                    <td className="p-4 font-mono font-bold text-slate-800">{log.cost}</td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(log.id, log.status)}
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                          log.status === "Completed"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                        }`}
                      >
                        {log.status}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenPartsModal(log)}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-400 transition-colors shadow-2xs active:scale-98"
                        >
                          <ShoppingBag size={12} /> Order Parts
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(log.id)}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Ticket"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
        <span>Maintenance alerts and work orders automatically sync from driver DVIR defect escalations.</span>
      </div>

      {/* Create Work Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md my-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-950">
                <Wrench size={20} className="text-amber-500" />
                Create Maintenance Work Order
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-600">Select Vehicle</label>
                <select
                  value={formData.vehicleName}
                  onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-amber-400"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Issue Title / Diagnostic Code</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Brake Pad Diagnostics & Replacement"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Detailed Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Front brake wear above threshold, replace rotors and pads..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-600">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-amber-400"
                  >
                    <option value="High">High Priority</option>
                    <option value="Routine">Routine Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-600">Estimated Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="e.g. 450.00"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Assigned Mechanic / Tech</label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="e.g. Lead Technician Dave"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-md disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Create Work Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Parts Requisition Modal (Multi-Item Support) */}
      {isPartsModalOpen && selectedOrderForParts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl my-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
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
              <button
                type="button"
                onClick={() => setIsPartsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Flagged Inspection Defects Banner */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs space-y-1">
              <span className="font-bold text-rose-950 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-rose-600 shrink-0" />
                DVIR Inspection Defect Details:
              </span>
              <p className="text-[11px] text-rose-800 leading-relaxed font-medium pl-5">
                {selectedOrderForParts.issue} — {selectedOrderForParts.description || "Defects reported during shift inspection."}
              </p>
            </div>

            <form onSubmit={handleConfirmOrderParts} className="space-y-4 text-xs">
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {partItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3 relative transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="grid size-5 place-items-center rounded-full bg-amber-400 text-[10px] font-extrabold text-slate-950">
                          {index + 1}
                        </span>
                        Part Line Item #{index + 1}
                      </span>

                      {partItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePartItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Remove Part Item"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Part Description / Component Name</label>
                      <input
                        type="text"
                        required
                        value={item.partName}
                        onChange={(e) => handleUpdatePartItem(item.id, "partName", e.target.value)}
                        placeholder="e.g. Heavy Duty Brake Pads (Front Set)"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="mb-1 block font-semibold text-slate-700">Part SKU / Number</label>
                        <input
                          type="text"
                          required
                          value={item.partNumber}
                          onChange={(e) => handleUpdatePartItem(item.id, "partNumber", e.target.value)}
                          placeholder="e.g. NAPA-BP-4902"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-slate-900 outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block font-semibold text-slate-700">Commercial Supplier</label>
                        <select
                          value={item.supplier}
                          onChange={(e) => handleUpdatePartItem(item.id, "supplier", e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-800 outline-none focus:border-amber-400"
                        >
                          <option value="NAPA Auto Parts Commercial">NAPA Auto Parts</option>
                          <option value="AutoZone Commercial">AutoZone Commercial</option>
                          <option value="O'Reilly Auto Parts">O'Reilly Auto Parts</option>
                          <option value="FleetPride Commercial">FleetPride Parts</option>
                          <option value="Amazon Business">Amazon Business</option>
                          <option value="eBay Motors">eBay Motors</option>
                          <option value="OEM Manufacturer Direct">OEM Direct</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="mb-1 block font-semibold text-slate-700">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleUpdatePartItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block font-semibold text-slate-700">Unit Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.unitCost}
                          onChange={(e) => handleUpdatePartItem(item.id, "unitCost", parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Another Part Item Button */}
              <div className="flex justify-start pt-1">
                <button
                  type="button"
                  onClick={handleAddPartItem}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100 transition-colors shadow-2xs"
                >
                  <Plus size={15} />
                  Add Another Replacement Part
                </button>
              </div>

              {/* Combined Expense Footer */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs flex items-center justify-between font-bold text-amber-950 shadow-2xs">
                <span>Total Combined Parts Expense ({partItems.length} {partItems.length === 1 ? "Item" : "Items"}):</span>
                <span className="font-mono text-base font-extrabold text-amber-950">
                  ${partItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0).toFixed(2)}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPartsModalOpen(false)}
                  disabled={isOrderingParts}
                  className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOrderingParts}
                  className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  <ShoppingBag size={15} />
                  {isOrderingParts ? "Processing Order..." : `Confirm Order (${partItems.length} Parts)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}