import Link from "next/link";
import {
  BarChart3,
  ClipboardCheck,
  Fuel,
  MapPin,
  Settings,
  Truck,
  Wrench,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: BarChart3 },
  { name: "Live Tracking", href: "/dashboard/tracking", icon: MapPin },
  { name: "DVIR & Inspection", href: "/dashboard/dvir", icon: ClipboardCheck },
  { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { name: "Assets & Tools", href: "/dashboard/assets", icon: Truck },
  { name: "Fuel & Expenses", href: "/dashboard/fuel", icon: Fuel },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#f7f7f3] text-slate-900">
      <aside className="flex w-64 flex-col justify-between border-r border-slate-200 bg-white">
        <div>
          <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
            <div className="rounded-md bg-amber-400 p-1.5 text-slate-950 shadow-sm shadow-amber-200/60">
              <Truck size={16} />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none tracking-tight">
                PRADO FLEET
              </h1>
              <span className="block text-[9px] uppercase tracking-widest text-slate-500">
                Asset Intelligence
              </span>
            </div>
          </div>

          <nav className="space-y-1 p-4">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Fleet Management
            </div>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-amber-50 hover:text-slate-900"
              >
                <item.icon size={18} className="text-amber-500" />
                {item.name}
              </Link>
            ))}

              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-amber-50 hover:text-slate-900"
              >
                <Settings size={18} className="text-amber-500" />
                Fleet Settings
              </Link>
            </nav>
          </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm shadow-slate-200/40">
          <h2 className="text-base font-semibold text-slate-800">
            Operations Control Center
          </h2>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              14/16 Trucks Active
            </span>
            <form method="post" action="/api/auth/signout">
              <button
                type="submit"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f7f7f3] p-6">{children}</main>
      </div>
    </div>
  );
}