import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Wrench } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_45%),linear-gradient(180deg,_#fffdf7_0%,_#f7f7f3_100%)] text-slate-900">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 md:py-24">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-400 p-2 text-slate-950 shadow-sm shadow-amber-200/70">
              <Truck size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight">PRADO FLEET</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Asset Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-500"
            >
              Start free
            </Link>
          </div>
        </header>

        <div className="space-y-10">
          <div className="relative flex flex-col gap-10 overflow-hidden p-8 md:flex-row md:items-center md:p-10">
            <div className="w-full space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
                Fleet operations for field teams
              </p>
              <h2 className="text-4xl font-bold leading-tight md:text-5xl">
                Run vehicles, inspections, and maintenance from one control center.
              </h2>
              <p className="max-w-xl text-sm text-slate-600 md:text-base">
                Prado Fleet centralizes telematics, DVIR checklists, diagnostics, and service workflows so your crews spend less time coordinating and more time on jobs.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-500"
                >
                  Create account <ArrowRight size={16} />
                </Link>
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Access dashboard
                </Link>
              </div>
            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Why teams switch</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShieldCheck size={16} className="text-emerald-500" /> Compliance in motion
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Mobile DVIR with auditable submissions and defect escalation.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Wrench size={16} className="text-amber-500" /> Predictive maintenance
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Turn telematics faults into parts and service workflows before breakdowns happen.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Truck size={16} className="text-amber-500" /> Live fleet visibility
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Track vehicle status, job destinations, and operating costs in real time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}