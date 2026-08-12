"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Fuel,
  HelpCircle,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Settings,
  Smartphone,
  Truck,
  User,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";

const allNavigation = [
  { name: "Overview", href: "/dashboard", icon: BarChart3, roles: ["MANAGER", "ADMIN"] },
  { name: "Live Tracking", href: "/dashboard/tracking", icon: MapPin, roles: ["MANAGER", "ADMIN"] },
  { name: "DVIR & Inspection", href: "/dashboard/dvir", icon: ClipboardCheck, roles: ["MANAGER", "ADMIN"] },
  { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench, roles: ["MANAGER", "ADMIN"] },
  { name: "Drivers & Team", href: "/dashboard/drivers", icon: Users, roles: ["MANAGER", "ADMIN"] },
  { name: "Assets & Tools", href: "/dashboard/assets", icon: Truck, roles: ["MANAGER", "ADMIN"] },
  { name: "Fuel & Expenses", href: "/dashboard/fuel", icon: Fuel, roles: ["MANAGER", "ADMIN"] },
  { name: "Driver Shift Portal", href: "/dashboard/driver-portal", icon: Smartphone, roles: ["DRIVER", "MANAGER", "ADMIN"] },
  { name: "Fleet Settings", href: "/dashboard/settings", icon: Settings, roles: ["MANAGER", "ADMIN"] },
];

type DashboardShellProps = {
  children: React.ReactNode;
  userName: string;
  userRole?: string;
};

export function DashboardShell({ children, userName, userRole = "MANAGER" }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isDriver = userRole === "DRIVER" || userRole === "COMMERCIAL_DRIVER";
  const [currentRole, setCurrentRole] = useState<"DRIVER" | "MANAGER">(
    isDriver ? "DRIVER" : "MANAGER"
  );

  const showCheckEmailBanner = searchParams.get("check_email") === "true";
  const showVerifiedBanner = searchParams.get("email_verified") === "true";

  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isDrawerOpen]);

  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      const res = await fetch("/api/auth/signout", { method: "POST" });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        window.location.href = "/signin";
      }
    } catch (err) {
      console.error("[Signout error]:", err);
      window.location.href = "/signin";
    } finally {
      setIsSigningOut(false);
    }
  };

  // Auto-redirect drivers away from manager-only routes
  useEffect(() => {
    if (!isDriver) return;
    const managerOnlyRoutes = ["/dashboard", "/dashboard/tracking", "/dashboard/dvir", "/dashboard/drivers", "/dashboard/maintenance", "/dashboard/assets", "/dashboard/fuel", "/dashboard/settings"];
    if (managerOnlyRoutes.includes(pathname)) {
      router.replace("/dashboard/driver-portal");
    }
  }, [isDriver, pathname, router]);

  const filteredNavigation = allNavigation.filter((item) =>
    currentRole === "DRIVER" ? item.roles.includes("DRIVER") : true
  );

  const navigationContent = (
    <div className="flex h-full flex-1 flex-col justify-between">
      <div>
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
          <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>{currentRole === "DRIVER" ? "Driver Field App" : "Fleet Management"}</span>
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-900">
              {currentRole}
            </span>
          </div>

          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsDrawerOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-50 text-slate-950 font-bold"
                    : "text-slate-600 hover:bg-amber-50 hover:text-slate-900"
                }`}
              >
                <item.icon size={18} className="text-amber-500" />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-100">
            <Link
              href="/dashboard/help"
              onClick={() => setIsDrawerOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === "/dashboard/help"
                  ? "bg-amber-50 text-slate-950 font-bold"
                  : "text-slate-600 hover:bg-amber-50 hover:text-slate-900"
              }`}
            >
              <HelpCircle size={18} className="text-amber-500" />
              <span>Help & Support</span>
            </Link>
          </div>
        </nav>
      </div>

      <div className="border-t border-slate-100 p-4">
        <p className="text-[11px] leading-relaxed text-slate-400">
          © 2026 Prado Systems. All rights reserved.
        </p>
      </div>
    </div>
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
              className="grid size-10 place-items-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              aria-label="Open navigation menu"
              aria-expanded={isDrawerOpen}
              aria-controls="mobile-navigation"
            >
              <Menu size={20} />
            </button>

            <span className="hidden font-sans text-xs font-semibold uppercase tracking-wider text-slate-400 sm:inline">
              {currentRole === "DRIVER" ? "Driver Shift Portal" : "Dispatch Control Center"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <PwaInstallPrompt />
            <div className="relative pl-2 border-l border-slate-200" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="grid size-8 place-items-center rounded-full bg-amber-400 font-sans text-xs font-extrabold text-slate-950 shadow-2xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <span className="block text-xs font-bold text-slate-900 leading-tight">{userName}</span>
                  <span className="block text-[10px] font-medium text-slate-400">Authenticated</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{userName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {userRole === "DRIVER" ? "Driver Account" : "Fleet Manager"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleSignOut();
                    }}
                    disabled={isSigningOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <LogOut size={15} className="text-rose-500" />
                    <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {showCheckEmailBanner && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 border-b border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-950 sm:px-6"
          >
            <div className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-amber-600" />
              <span>
                <strong>Check your email!</strong> A confirmation link has been sent to your inbox.
              </span>
            </div>
            <Link
              href={pathname}
              className="font-bold text-amber-900 underline hover:text-amber-950"
            >
              Dismiss
            </Link>
          </div>
        )}

        {showVerifiedBanner && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 border-b border-emerald-300 bg-emerald-50 px-4 py-3 text-xs text-emerald-950 sm:px-6"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>
                <strong>Email verified successfully!</strong> Your Prado Fleet account is fully active.
              </span>
            </div>
            <Link
              href={pathname}
              className="font-bold text-emerald-900 underline hover:text-emerald-950"
            >
              Dismiss
            </Link>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-[#f7f7f3] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}