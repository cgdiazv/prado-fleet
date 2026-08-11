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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPortalData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-amber-500" : "text-slate-400"} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:bg-amber-500 transition-all active:scale-98"
          >
            <Plus size={16} />
            Create Work Order
          </button>
        </div>
      </div>

      {/* Service Tickets Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-900">Active Work Orders & Service Tickets</h2>
          <Calendar size={16} className="text-amber-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="p-4">Vehicle / Asset</th>
                <th className="p-4">Work Order Title & Description</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Assigned Mechanic</th>
                <th className="p-4">Cost Est.</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading maintenance work orders from database...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No active maintenance tickets found. Click &quot;Create Work Order&quot; to log a repair job.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{log.vehicle}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {log.priority === "High" && <AlertTriangle size={15} className="shrink-0 text-rose-500" />}
                        {log.issue}
                      </p>
                      {log.description && <p className="text-[11px] text-slate-500 mt-0.5">{log.description}</p>}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                          log.priority === "High"
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : "border-slate-200 bg-slate-100 text-slate-600"
                        }`}
                      >
                        {log.priority}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{log.assignedTo}</td>
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
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-400 transition-colors"
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
    </div>
  );
}