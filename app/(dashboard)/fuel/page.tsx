"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  DollarSign,
  Fuel,
  Plus,
  RefreshCw,
  Trash2,
  TrendingDown,
  Truck,
  X,
} from "lucide-react";

type FuelTransaction = {
  id: string;
  vehicle: string;
  driver: string;
  gallons: string;
  amount: string;
  odometer: string;
  location: string;
  status: string;
  date: string;
};

type VehicleItem = {
  id: string;
  name: string;
};

export default function FuelPage() {
  const [logs, setLogs] = useState<FuelTransaction[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [totalSpend, setTotalSpend] = useState("$0.00");
  const [totalGallons, setTotalGallons] = useState("0.0 gal");
  const [transactionCount, setTransactionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fuel Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    vehicleName: "",
    driverName: "Alex Rivera",
    gallons: "",
    totalCost: "",
    odometer: "48210",
  });

  const fetchFuelData = async () => {
    try {
      setIsLoading(true);
      const [fuelRes, vehiclesRes] = await Promise.all([
        fetch("/api/fuel"),
        fetch("/api/telematics/location"),
      ]);

      if (fuelRes.ok) {
        const data = await fuelRes.json();
        setTotalSpend(data.totalSpend || "$0.00");
        setTotalGallons(data.totalGallons || "0.0 gal");
        setTransactionCount(data.transactionCount || 0);
        setLogs(data.logs || []);
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
      console.error("[FuelPage] Error fetching fuel data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelData();
  }, []);

  const handleCreateFuelLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gallons || !formData.totalCost) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/fuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchFuelData();
        setIsModalOpen(false);
        setFormData({
          vehicleName: vehicles[0]?.name || "",
          driverName: "Alex Rivera",
          gallons: "",
          totalCost: "",
          odometer: "48210",
        });
      }
    } catch (err) {
      console.error("[FuelPage] Error saving fuel entry:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFuelLog = async (id: string) => {
    try {
      await fetch(`/api/fuel?id=${id}`, { method: "DELETE" });
      await fetchFuelData();
    } catch (err) {
      console.error("[FuelPage] Error deleting fuel log:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Fuel className="text-amber-500" size={24} />
            Fuel & Operating Expense Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track fleet fuel logs, gallons refueled, and operating expense transactions in Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchFuelData}
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
            <Plus size={16} /> Log Fuel Purchase
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Fuel Spend
          </span>
          <div className="mt-1 text-2xl font-bold text-slate-950">{totalSpend}</div>
          <p className="mt-1 flex items-center gap-1 text-xs text-amber-600 font-medium">
            Computed from active database logs
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Gallons Refueled
          </span>
          <div className="mt-1 text-2xl font-bold text-slate-950">{totalGallons}</div>
          <p className="mt-1 text-xs text-slate-500 font-medium">Fleet wide total</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Synced Fuel Logs
          </span>
          <div className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-950">
            {transactionCount} Entries <CreditCard size={20} className="text-amber-500" />
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">Driver & Manager synced logs</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <h2 className="text-sm font-semibold text-slate-900">Recent Fuel Card Transactions</h2>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading fuel transaction records from Supabase...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No fuel logs found. Click &quot;Log Fuel Purchase&quot; to add a transaction.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-amber-50/50 p-4 text-xs transition-colors hover:bg-amber-50"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-100 p-2.5 text-amber-900 shrink-0">
                    <Fuel size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      {tx.vehicle} • {tx.driver}
                    </p>
                    <p className="mt-0.5 text-slate-500">
                      {tx.location} • {tx.gallons} ({tx.odometer}) • {tx.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{tx.amount}</p>
                    <span className="text-[10px] font-semibold text-emerald-600">{tx.status}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteFuelLog(tx.id)}
                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete Fuel Entry"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fuel Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md my-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-950">
                <Fuel size={20} className="text-amber-500" />
                Log Fuel Purchase
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateFuelLog} className="space-y-3 text-xs">
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
                <label className="mb-1 block font-medium text-slate-600">Driver Name</label>
                <input
                  type="text"
                  required
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-600">Gallons Purchased</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.gallons}
                    onChange={(e) => setFormData({ ...formData, gallons: e.target.value })}
                    placeholder="e.g. 24.5"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-600">Total Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.totalCost}
                    onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                    placeholder="e.g. 85.75"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Current Odometer Reading (mi)</label>
                <input
                  type="number"
                  value={formData.odometer}
                  onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                  placeholder="e.g. 48210"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-amber-400"
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
                  {isSaving ? "Saving..." : "Save Fuel Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}