"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Fuel,
  MapPin,
  Menu,
  ShieldCheck,
  Truck,
  Wrench,
  X,
  Zap,
} from "lucide-react";

export function MainHeader() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const navLinks = [
    {
      name: "Pricing & Plans",
      href: "/pricing",
      icon: Zap,
      desc: "Flexible per-vehicle plans & free starter tier",
    },
    {
      name: "DVIR Inspections",
      href: "/dashboard/dvir",
      icon: ShieldCheck,
      desc: "Mobile checklists & defect escalation",
    },
    {
      name: "Live Telematics",
      href: "/dashboard/tracking",
      icon: MapPin,
      desc: "Real-time location & status",
    },
    {
      name: "Predictive Maintenance",
      href: "/dashboard/maintenance",
      icon: Wrench,
      desc: "Work orders & service workflows",
    },
    {
      name: "Fuel & Expenses",
      href: "/dashboard/fuel",
      icon: Fuel,
      desc: "Cost tracking & efficiency metrics",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-amber-200/50 bg-[#fffdf7]/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          {/* Logo & Brand */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="rounded-xl bg-amber-400 p-2 text-slate-950 shadow-sm shadow-amber-200/80 transition-transform group-hover:scale-105">
              <Truck size={22} className="text-slate-950" />
            </div>
            <div>
              <span className="font-sans text-xl font-bold leading-none tracking-tight text-slate-950">
                Prado Fleet
              </span>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-slate-500">
                Asset Intelligence
              </p>
            </div>
          </Link>

          {/* Desktop Action Buttons */}
          <div className="hidden items-center gap-5 md:flex">
            <Link
              href="/pricing"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
            >
              <BarChart3 size={16} className="text-slate-500" />
              Dashboard
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4.5 py-2 text-sm font-semibold text-slate-950 shadow-sm shadow-amber-200 transition-all hover:bg-amber-500 hover:shadow-amber-300"
            >
              Start free <ArrowRight size={16} />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/signin"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-lg bg-transparent text-slate-700 hover:text-slate-950 focus:outline-none transition-colors p-0"
              aria-label="Open main menu"
              aria-expanded={isOpen}
              aria-controls="mobile-drawer"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay / Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Sliding Drawer Menu */}
      <aside
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={`fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col justify-between border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-400 p-2 text-slate-950 shadow-sm shadow-amber-200">
              <Truck size={18} />
            </div>
            <div>
              <span className="font-sans text-lg font-bold leading-tight text-slate-950">
                Prado Fleet
              </span>
              <p className="text-[9px] uppercase tracking-widest text-slate-500">
                Navigation Menu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="grid size-9 place-items-center rounded-lg bg-transparent text-slate-500 hover:text-slate-950 focus:outline-none transition-colors p-0"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <nav className="space-y-1.5" aria-label="Mobile links">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50 active:bg-amber-50/70"
              >
                <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-amber-600 shadow-2xs transition-colors group-hover:border-amber-300 group-hover:bg-amber-50">
                  <item.icon size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 group-hover:text-amber-700">
                    {item.name}
                  </div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Drawer Footer Actions */}
        <div className="border-t border-slate-100 bg-slate-50/70 p-5 space-y-3">
          <Link
            href="/signup"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-amber-200/80 transition-transform active:scale-[0.98] hover:bg-amber-500"
          >
            Start free <ArrowRight size={16} />
          </Link>

          <Link
            href="/signin"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 shadow-2xs hover:bg-slate-100"
          >
            Sign In to Account
          </Link>

          <div className="pt-2 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All telematics systems operational
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
