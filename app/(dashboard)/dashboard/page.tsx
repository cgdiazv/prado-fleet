import { AlertTriangle, Fuel, ShieldCheck, Truck, Wrench } from "lucide-react";

export default function FleetOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Active Fleet</span>
            <Truck size={18} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">14 / 16</div>
          <p className="mt-1 text-xs text-slate-500">2 vehicles in shop</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Pending DVIR Alerts</span>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">3 Issues</div>
          <p className="mt-1 text-xs text-amber-700/80">1 critical brake warning</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Safety Score</span>
            <ShieldCheck size={18} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">94 / 100</div>
          <p className="mt-1 text-xs text-emerald-600">+2.4% vs last week</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Avg Cost / Mile</span>
            <Fuel size={18} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">$0.62</div>
          <p className="mt-1 text-xs text-slate-500">Fuel + Maintenance + Depr.</p>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-yellow-50 p-5 md:flex-row md:items-center shadow-sm shadow-slate-200/40">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            Prado Commerce Integration Triggered
          </span>
          <h3 className="mt-1 text-base font-semibold text-slate-900">
            Diagnostic Fault Detected: Truck #04 (P0300 Engine Misfire)
          </h3>
          <p className="mt-0.5 text-sm text-slate-600">
            Auto-generated replacement order for 8 Spark Plugs &amp; Ignition Coils in Prado Commerce.
          </p>
        </div>
        <button className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-500">
          <Wrench size={16} /> Review Parts Order
        </button>
      </div>
    </div>
  );
}