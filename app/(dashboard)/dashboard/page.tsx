"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Fuel, RefreshCw, ShieldCheck, Truck, Wrench } from "lucide-react";
import Link from "next/link";

type OverviewMetrics = {
  activeFleet: {
    active: number;
    total: number;
    inShop: number;
  };
  alerts: {
    count: number;
    criticalMessage: string;
  };
  safetyScore: {
    score: number;
    comparison: string;
  };
  costPerMile: string;
  onDutyDrivers: number;
  bannerAlert: {
    title: string;
    description: string;
  } | null;
};

export default function FleetOverviewPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/overview");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error("[FleetOverviewPage] Error fetching overview:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fleet Operations Command Center</h1>
          <p className="text-xs text-slate-500">Live operational overview computed from active database telemetry.</p>
        </div>

        <button
          type="button"
          onClick={fetchOverview}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin text-amber-500" : "text-slate-400"} />
          Refresh Command Center
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Active Fleet */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Fleet</span>
            <Truck size={18} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950">
            {metrics ? `${metrics.activeFleet.active} / ${metrics.activeFleet.total}` : "-- / --"}
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {metrics ? `${metrics.activeFleet.inShop} vehicle(s) in maintenance` : "Syncing fleet status..."}
          </p>
        </div>

        {/* Pending DVIR Alerts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending DVIR Alerts</span>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            {metrics ? `${metrics.alerts.count} Issues` : "-- Issues"}
          </div>
          <p className="mt-1 text-xs text-amber-700/80 font-medium truncate">
            {metrics?.alerts.criticalMessage || "Checking inspection logs..."}
          </p>
        </div>

        {/* Safety Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Safety Score</span>
            <ShieldCheck size={18} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950">
            {metrics ? `${metrics.safetyScore.score} / 100` : "-- / 100"}
          </div>
          <p className="mt-1 text-xs text-amber-600 font-medium">
            {metrics?.safetyScore.comparison || "DOT compliance active"}
          </p>
        </div>

        {/* Avg Cost / Mile */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Cost / Mile</span>
            <Fuel size={18} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-950">
            {metrics ? metrics.costPerMile : "$0.00"}
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">Fuel + Maintenance analytics</p>
        </div>
      </div>

      {/* Integration Alert Banner */}
      {metrics?.bannerAlert ? (
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-yellow-50 p-5 md:flex-row md:items-center shadow-2xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-amber-800">
              Prado Maintenance & Defect Alert Triggered
            </span>
            <h3 className="mt-1 text-base font-bold text-slate-950">
              {metrics.bannerAlert.title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-600">
              {metrics.bannerAlert.description}
            </p>
          </div>
          <Link
            href="/dashboard/dvir"
            className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-500 shadow-2xs"
          >
            <Wrench size={16} /> Review Defect Escalations
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 md:flex-row md:items-center shadow-2xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-emerald-800">
              All Fleet Systems Operational
            </span>
            <h3 className="mt-1 text-base font-bold text-slate-950">
              No Critical DVIR Defects or Open Maintenance Warnings
            </h3>
            <p className="mt-0.5 text-xs text-slate-600">
              Drivers are streaming live GPS telematics and all safety inspection checklists passed.
            </p>
          </div>
          <Link
            href="/dashboard/driver-portal"
            className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-500 shadow-2xs"
          >
            Open Driver Portal
          </Link>
        </div>
      )}
    </div>
  );
}