import React from 'react';
import { Wrench, AlertTriangle, CheckCircle2, ShoppingBag, Calendar } from 'lucide-react';

const maintenanceLogs = [
  { id: '1', vehicle: 'Truck 04', issue: 'OBD Code P0300 (Engine Misfire)', priority: 'High', status: 'Parts Ordered', date: 'Today' },
  { id: '2', vehicle: 'Truck 01', issue: 'Scheduled Oil Change & Filter', priority: 'Routine', status: 'Pending Schedule', date: 'In 3 days' },
  { id: '3', vehicle: 'Trailer B', issue: 'Brake Pad Replacement', priority: 'Medium', status: 'In Shop', date: 'Yesterday' },
];

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Wrench className="text-amber-500" size={22} />
            Preventive Maintenance & OBD Diagnostics
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track engine fault codes, schedule service reminders, and auto-source parts via Prado Commerce.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700">Active Service Tickets & Diagnostics</h2>
          <Calendar size={16} className="text-amber-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-amber-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="p-4">Vehicle / Asset</th>
                <th className="p-4">Issue / Diagnostics</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {maintenanceLogs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-amber-50/70">
                  <td className="p-4 font-semibold text-slate-900">{log.vehicle}</td>
                  <td className="flex items-center gap-2 p-4 text-slate-700">
                    {log.priority === 'High' && <AlertTriangle size={16} className="shrink-0 text-rose-400" />}
                    {log.issue}
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                        log.priority === 'High'
                          ? 'border-rose-200 bg-rose-50 text-rose-600'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {log.priority}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500">{log.status}</td>
                  <td className="p-4">
                    <button className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100">
                      <ShoppingBag size={14} className="text-amber-400" /> Order Parts
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
        <CheckCircle2 size={14} className="text-emerald-500" /> Maintenance alerts automatically sync from DVIR defects and telematics faults.
      </div>
    </div>
  );
}