"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import Link from "next/link";

type DvirRecord = {
  id: string;
  vehicleName: string;
  driverName: string;
  type: "PRE_TRIP" | "POST_TRIP";
  status: "PASSED" | "DEFECTS_FOUND" | "WORK_ORDER_CREATED";
  odometer: number;
  defects: string[];
  submittedAt: string;
  signature: string;
};

export default function DVIRPage() {
  const [logs, setLogs] = useState<DvirRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "PASSED" | "DEFECTS">("ALL");

  const fetchDvirLogs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/dvir");
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      console.error("[DVIRPage] Failed to fetch logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDvirLogs();
  }, []);

  const handleEscalateToWorkOrder = async (log: DvirRecord) => {
    try {
      // 1. Persist DVIR status change to WORK_ORDER_CREATED in Supabase
      await fetch("/api/dvir", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: log.id, status: "WORK_ORDER_CREATED" }),
      });

      // 2. Post maintenance work order to Supabase
      await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleName: log.vehicleName,
          title: `DVIR Defect: ${log.defects[0] || "Safety Fault"}`,
          description: `Flagged by driver ${log.driverName} during ${log.type === "PRE_TRIP" ? "pre-trip" : "post-trip"} inspection at ${log.odometer} mi.`,
          priority: "HIGH",
        }),
      });

      // 3. Update local state
      setLogs(
        logs.map((l) =>
          l.id === log.id ? { ...l, status: "WORK_ORDER_CREATED" } : l
        )
      );
    } catch (err) {
      console.error("[DVIRPage] Failed to escalate defect:", err);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.defects.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterType === "PASSED") return matchesSearch && log.status === "PASSED";
    if (filterType === "DEFECTS") return matchesSearch && log.status !== "PASSED";
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <ClipboardCheck className="text-amber-500" size={24} />
            Fleet DVIR Compliance & Audit Hub
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manager review portal for driver pre-trip/post-trip inspections, DOT compliance, and 1-click maintenance escalation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={fetchDvirLogs}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-amber-500" : "text-slate-400"} />
            Refresh
          </button>
          <Link
            href="/dashboard/driver-portal"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-xs hover:bg-amber-500 transition-colors"
          >
            <Plus size={16} /> Driver Mobile Portal
          </Link>
        </div>
      </div>

      {/* Compliance Metrics Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Submitted Inspections</p>
            <p className="text-2xl font-bold text-slate-950">{logs.length}</p>
          </div>
          <div className="rounded-xl bg-amber-100 p-3 text-amber-900">
            <ClipboardCheck size={20} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Fleet Pass Rate</p>
            <p className="text-2xl font-bold text-amber-600">
              {logs.length > 0
                ? `${Math.round(
                    (logs.filter((l) => l.status === "PASSED").length / logs.length) * 100
                  )}%`
                : "100%"}
            </p>
          </div>
          <div className="rounded-xl bg-blue-100 p-3 text-blue-800">
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Flagged Defects / Escalate</p>
            <p className="text-2xl font-bold text-amber-600">
              {logs.filter((l) => l.status !== "PASSED").length}
            </p>
          </div>
          <div className="rounded-xl bg-amber-100 p-3 text-amber-800">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by driver, truck unit, or defect description..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
              filterType === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Logs
          </button>
          <button
            type="button"
            onClick={() => setFilterType("PASSED")}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
              filterType === "PASSED"
                ? "bg-emerald-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Passed Only
          </button>
          <button
            type="button"
            onClick={() => setFilterType("DEFECTS")}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
              filterType === "DEFECTS"
                ? "bg-amber-500 text-slate-950"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Flagged Defects
          </button>
        </div>
      </div>

      {/* DVIR Audit Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">Vehicle & Driver</th>
                <th className="p-4">Type</th>
                <th className="p-4">Odometer</th>
                <th className="p-4">Compliance Status</th>
                <th className="p-4">Defects & Observations</th>
                <th className="p-4">Submitted At</th>
                <th className="p-4 text-right">Manager Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading DVIR inspection logs from database...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No matching DVIR inspection logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-lg bg-amber-100 p-2 text-amber-800 shrink-0">
                          <Truck size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{log.vehicleName}</p>
                          <p className="text-[11px] text-slate-500">Driver: {log.driverName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-700">
                        {log.type === "PRE_TRIP" ? "Pre-Trip Inspection" : "Post-Trip Inspection"}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-800">
                      {log.odometer.toLocaleString()} mi
                    </td>
                    <td className="p-4">
                      {log.status === "PASSED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          <CheckCircle2 size={12} className="text-emerald-600" /> Passed
                        </span>
                      ) : log.status === "WORK_ORDER_CREATED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">
                          <Wrench size={12} className="text-blue-600" /> Work Order Created
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                          <AlertTriangle size={12} className="text-rose-600" /> Defect Flagged
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {log.defects.length > 0 ? (
                        <div className="space-y-1">
                          {log.defects.map((d, idx) => (
                            <span key={idx} className="block text-rose-700 font-semibold">
                              ⚠️ {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">No safety defects reported</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 font-medium">
                      {log.submittedAt}
                      <span className="block text-[10px] text-slate-400">Signed: {log.signature}</span>
                    </td>
                    <td className="p-4 text-right">
                      {log.status === "DEFECTS_FOUND" ? (
                        <button
                          type="button"
                          onClick={() => handleEscalateToWorkOrder(log)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-500 transition-colors shadow-2xs"
                        >
                          <Wrench size={13} />
                          Escalate to Maintenance
                        </button>
                      ) : log.status === "WORK_ORDER_CREATED" ? (
                        <Link
                          href="/dashboard/maintenance"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          View Work Order →
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Audit Cleared</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}