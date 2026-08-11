"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ClipboardCheck,
  Fuel,
  MapPin,
  Menu,
  Settings,
  Truck,
  Wrench,
  X,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: BarChart3 },
  { name: "Live Tracking", href: "/dashboard/tracking", icon: MapPin },
  { name: "DVIR & Inspection", href: "/dashboard/dvir", icon: ClipboardCheck },
  { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { name: "Assets & Tools", href: "/dashboard/assets", icon: Truck },
  { name: "Fuel & Expenses", href: "/dashboard/fuel", icon: Fuel },
  { name: "Fleet Settings", href: "/dashboard/settings", icon: Settings },
];

type DashboardShellProps = {
  children: React.ReactNode;
  userName: string;
};

export function DashboardShell({ children, userName }: DashboardShellProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsDrawerOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isDrawerOpen]);

  const navigationContent = (
    <>
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
        <div className="rounded-md bg-amber-400 p-1.5 text-slate-950 shadow-sm shadow-amber-200/60">
          <Truck size={16} />
        </div>
        <div>
          <h1 className="font-sans text-xl font-bold leading-none tracking-normal">Prado Fleet</h1>
          <span className="block text-[9px] uppercase tracking-widest text-slate-500">
            Asset Intelligence
          </span>
        </div>
      </div>

      <nav className="space-y-1 p-4" aria-label="Fleet management">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Fleet Management
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsDrawerOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amber-50 text-slate-950"
                  : "text-slate-600 hover:bg-amber-50 hover:text-slate-900"
              }`}
            >
              <item.icon size={18} className="text-amber-500" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex h-screen bg-[#f7f7f3] text-slate-900">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        {navigationContent}
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-200 lg:hidden ${
          isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setIsDrawerOpen(false)}
      />
      <aside
        id="mobile-navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile navigation"
        aria-hidden={!isDrawerOpen}
      >
        <button
          type="button"
          onClick={() => setIsDrawerOpen(false)}
          className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        {navigationContent}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm shadow-slate-200/40 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="grid size-10 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-label="Open menu"
              aria-controls="mobile-navigation"
              aria-expanded={isDrawerOpen}
            >
              <Menu size={20} />
            </button>
            <h2 className="truncate text-sm font-semibold text-slate-800 sm:text-base">
              Operations Control Center
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <span className="hidden text-xs font-medium text-slate-600 sm:inline">{userName}</span>
            <span className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 md:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
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

        <main className="flex-1 overflow-y-auto bg-[#f7f7f3] p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}