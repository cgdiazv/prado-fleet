import React from 'react';
import { Fuel, DollarSign, TrendingDown, CreditCard } from 'lucide-react';

export default function FuelPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Fuel className="text-amber-500" size={22} />
            Fuel & Operating Expense Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Fuel card integrations (WEX/Fleetcor), fuel fraud detection, and cost-per-mile calculations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
          <span className="text-xs font-semibold uppercase text-slate-500">Monthly Fuel Spend</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">$4,820.50</div>
          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
            <TrendingDown size={14} /> -3.2% optimization vs last month
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
          <span className="text-xs font-semibold uppercase text-slate-500">Average MPG</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">14.8 MPG</div>
          <p className="mt-1 text-xs text-slate-500">Fleet wide average</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
          <span className="text-xs font-semibold uppercase text-slate-500">Synced Fuel Cards</span>
          <div className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
            16 Active <CreditCard size={20} className="text-purple-400" />
          </div>
          <p className="mt-1 text-xs text-slate-500">WEX Integration Active</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
        <h2 className="text-sm font-semibold text-slate-700">Recent Fuel Card Transactions</h2>
        <div className="space-y-3">
          {[
            { id: '1', vehicle: 'Truck 04', driver: 'Carlos M.', gallons: '24.5 gal', amount: '$85.75', location: 'Shell - Station #402', status: 'Verified' },
            { id: '2', vehicle: 'Truck 01', driver: 'Alex R.', gallons: '18.2 gal', amount: '$63.70', location: 'Exxon - Highway 10', status: 'Verified' },
          ].map((tx) => (
            <div key={tx.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-amber-50/60 p-4 text-xs">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {tx.vehicle} • {tx.driver}
                </p>
                <p className="mt-0.5 text-slate-500">
                  {tx.location} • {tx.gallons}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{tx.amount}</p>
                <span className="text-[10px] font-semibold text-emerald-600">{tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}