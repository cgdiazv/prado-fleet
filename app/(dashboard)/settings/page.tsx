import { BellRing, Lock, Settings2, UserRound } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Administration</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Fleet Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Configure preferences for users, alerting, and fleet-wide operating rules.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <UserRound size={16} className="text-amber-500" /> User Access
          </div>
          <p className="mt-2 text-sm text-slate-600">Manage roles for dispatch, technicians, and admins.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <BellRing size={16} className="text-amber-400" /> Alerts
          </div>
          <p className="mt-2 text-sm text-slate-600">Set thresholds for DVIR, telematics faults, and maintenance notifications.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Lock size={16} className="text-emerald-400" /> Security
          </div>
          <p className="mt-2 text-sm text-slate-600">Review authentication, device access, and audit controls.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Settings2 size={16} className="text-purple-400" /> Integrations
          </div>
          <p className="mt-2 text-sm text-slate-600">Connect Prado Jobs, Prado Commerce, and telematics sources.</p>
        </div>
      </div>
    </div>
  );
}