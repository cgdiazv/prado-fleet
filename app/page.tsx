import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Fuel,
  MapPin,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import { MainHeader } from "@/components/MainHeader";
import { FeatureCarousel } from "@/components/FeatureCarousel";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,_rgba(251,191,36,0.28),_transparent_65%),linear-gradient(180deg,_#fffdf7_0%,_#f7f7f3_100%)] text-slate-900 flex flex-col">
      {/* Sliding Mobile Drawer & Main Navigation Header */}
      <MainHeader />

      <main className="flex-1">
        <section className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 md:py-20">
          {/* Hero Section */}
          <div className="relative flex flex-col items-start gap-8 overflow-hidden rounded-3xl border border-amber-200/60 bg-white/70 p-6 shadow-xl shadow-amber-900/5 backdrop-blur-sm sm:p-10 md:flex-row md:items-center">
            <div className="w-full space-y-6 md:w-3/5">
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/90 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800">
                <Sparkles size={14} className="text-amber-600 animate-pulse" />
                Fleet Operations Control Center
              </p>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
                Run vehicles, DVIR inspections & maintenance from one platform.
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Prado Fleet centralizes live telematics, digital DVIR checklists, diagnostic fault escalation, and service workflows so field crews stay compliant and productive.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-md shadow-amber-200/90 transition-all hover:bg-amber-500 hover:shadow-amber-300"
                >
                  Start free <ArrowRight size={18} />
                </Link>
                <Link
                  href="/signin"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-400 hover:bg-slate-50"
                >
                  <BarChart3 size={18} className="text-slate-500" />
                  Access Dashboard
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={15} className="text-amber-500" /> No credit card required
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={15} className="text-amber-500" /> Instant mobile DVIR setup
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={15} className="text-amber-500" /> DOT & OSHA ready
                </span>
              </div>
            </div>

            {/* Hero Commercial Service Vans Image */}
            <div className="w-full md:w-2/5">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-2xl transition-transform hover:scale-[1.01]">
                <Image
                  src="/service-vans-hero.png"
                  alt="Prado Commercial Service Vans & Utility Trucks Fleet"
                  width={800}
                  height={550}
                  priority
                  className="h-64 sm:h-80 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-5 flex flex-col justify-end">
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/95 px-3 py-1 text-xs font-bold text-slate-950 w-fit backdrop-blur-md shadow-sm">
                    <Truck size={14} /> Service Fleet Ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Feature Showcase Carousel Section */}
          <section className="w-full">
            <FeatureCarousel />
          </section>
          

          {/* Features Grid Section */}
          <div id="features" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-start justify-between gap-2 border-b border-slate-100 pb-6 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                  Built For High Performance Fleets
                </p>
                <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
                  Why fleet managers & drivers switch to Prado
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                Streamline operations with mobile-first interfaces and real-time asset telemetry.
              </p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div id="dvir" className="group scroll-mt-24 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-amber-300 hover:bg-white hover:shadow-md">
                <div className="inline-flex rounded-xl bg-emerald-100 p-3 text-emerald-700 shadow-2xs group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  Compliance in Motion
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Mobile DVIR checklists with mandatory photos, signature capture, and instant defect escalation for DOT compliance.
                </p>
              </div>

              <div id="maintenance" className="group scroll-mt-24 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-amber-300 hover:bg-white hover:shadow-md">
                <div className="inline-flex rounded-xl bg-amber-100 p-3 text-amber-800 shadow-2xs group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                  <Wrench size={24} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  Predictive Maintenance
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Automatically convert telematics engine faults into prioritized work orders and parts requests before costly breakdowns happen.
                </p>
              </div>

              <div id="telematics" className="group scroll-mt-24 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-amber-300 hover:bg-white hover:shadow-md">
                <div className="inline-flex rounded-xl bg-blue-100 p-3 text-blue-700 shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <MapPin size={24} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  Live Telematics & GPS
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Track active vehicle positions, job site ETAs, speed alerts, and route efficiency across your entire mobile fleet.
                </p>
              </div>

              <div id="fuel" className="group scroll-mt-24 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-amber-300 hover:bg-white hover:shadow-md">
                <div className="inline-flex rounded-xl bg-purple-100 p-3 text-purple-700 shadow-2xs group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Fuel size={24} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  Fuel & Expense Tracking
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Log fuel purchases, monitor idle time cost, and analyze cost-per-mile metrics for each truck and trailer.
                </p>
              </div>

              <div className="group scroll-mt-24 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-amber-300 hover:bg-white hover:shadow-md">
                <div className="inline-flex rounded-xl bg-orange-100 p-3 text-orange-700 shadow-2xs group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <ClipboardCheck size={24} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  Work Order Automation
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Assign mechanics, track repair progress, and maintain permanent audit histories for all asset maintenance.
                </p>
              </div>

              <div className="group scroll-mt-24 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-amber-300 hover:bg-white hover:shadow-md">
                <div className="inline-flex rounded-xl bg-slate-200 p-3 text-slate-800 shadow-2xs group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Truck size={24} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  Asset Lifecycle Control
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Manage registration renewals, insurance documents, vehicle assignments, and depreciation schedules seamlessly.
                </p>
              </div>
            </div>
          </div>

          {/* Standalone Start Free CTA Section */}
          <section className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm text-slate-950 sm:p-10">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="space-y-2 max-w-xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <Sparkles size={13} className="text-amber-600" /> Get Started Today
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                  Ready to streamline your fleet operations?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Set up your workspace in minutes with mobile-first DVIR compliance, live telematics, and automated work orders. No credit card required.
                </p>
              </div>

              <div className="w-full md:w-auto shrink-0">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-7 py-4 text-sm font-bold text-slate-950 shadow-md shadow-amber-200/90 transition-all hover:bg-amber-500 active:scale-98"
                >
                  Start free <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </section>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Prado Systems. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            <Link href="/privacy" className="font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}