import React from 'react';
import { Package, Link2, Truck, Briefcase, Plus } from 'lucide-react';

const equipmentList = [
  { id: '1', name: 'Commercial Pressure Washer Unit B', category: 'Heavy Equipment', assignedTo: 'Truck 04', jobSite: 'Site #88 - Metro Center' },
  { id: '2', name: 'Tandem Utility Trailer (16ft)', category: 'Trailer', assignedTo: 'Truck 09', jobSite: 'Depot Yard B' },
  { id: '3', name: 'Stihl Gas Auger Set', category: 'Power Tool', assignedTo: 'Truck 01', jobSite: 'Site #104 - Oak Ridge' },
];

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Package className="text-emerald-500" size={22} />
            Equipment & Tool Asset Tracking
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Assign heavy equipment, trailers, and job site tools directly to fleet vehicles.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-500">
          <Plus size={16} /> Register New Asset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {equipmentList.map((item) => (
          <div key={item.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {item.category}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{item.name}</h3>

            <div className="space-y-1.5 border-t border-slate-200 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-amber-500" />
                <span>
                  Assigned to: <strong className="text-slate-800">{item.assignedTo}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-amber-400" />
                <span>
                  Prado Job Location: <strong className="text-slate-800">{item.jobSite}</strong>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}