"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MainHeader } from "@/components/MainHeader";
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");

  const plans = [
    {
      name: "Starter",
      badge: "Free Forever",
      target: "Small trade teams (1–3 Trucks)",
      priceMonthly: "$0",
      priceAnnual: "$0",
      priceSubtext: "/ month (Free Forever)",
      popular: false,
      ctaText: "Start free",
      ctaHref: "/signup",
      ctaStyle: "bg-slate-900 text-white hover:bg-slate-800",
      features: [
        "Digital DVIR Mobile Inspection Forms",
        "Manual tool & equipment assignment to vehicles",
        "Basic calendar maintenance reminder logs",
        "Manual fuel purchase logging",
        "Standard email support",
      ],
    },
    {
      name: "Professional",
      badge: "Most Popular",
      target: "Small-to-midsize fleets (4–25 Trucks)",
      priceMonthly: "$149",
      priceAnnual: "$119",
      priceSubtext: billingCycle === "annual" ? "/ month (billed annually at $1,428/yr)" : "/ month (billed monthly)",
      popular: true,
      ctaText: "Start 14-Day Free Trial",
      ctaHref: "/signup?plan=pro",
      ctaStyle: "bg-amber-400 text-slate-950 hover:bg-amber-500 shadow-md shadow-amber-200",
      features: [
        "Everything in Starter, plus:",
        "Real-time GPS & driver route tracking (Mapbox overlays)",
        "Geofence arrival/departure alerts synced to Prado Jobs",
        "Plug-and-play OBD-II engine fault code monitoring",
        "Driver Safety Scoring (speed, harsh braking, idling)",
        "Fuel card sync (WEX/Fleetcor) & cost-per-mile analytics",
        "Prado Commerce Bridge: Auto-trigger replacement parts",
        "Priority 24/7 support",
      ],
    },
    {
      name: "Enterprise",
      badge: "Up to 50 Trucks",
      target: "50 Trucks included (50+ Trucks: Custom Quote)",
      priceMonthly: "$349",
      priceAnnual: "$279",
      priceSubtext: billingCycle === "annual" ? "/ month (billed annually at $3,348/yr)" : "/ month (billed monthly)",
      popular: false,
      ctaText: "Start 30-Day Free Trial",
      ctaHref: "/signup?plan=enterprise",
      ctaStyle: "bg-slate-900 text-white hover:bg-slate-800",
      features: [
        "Everything in Professional, plus:",
        "Flat rate for up to 50 trucks (50+ trucks: Custom Enterprise quote)",
        "Advanced asset tracking for heavy equipment & trailers (BLE/GPS tags)",
        "Dedicated API webhooks for enterprise ERPs & warehouse systems",
        "Automated PO creation directly into Prado Commerce with corporate workflows",
        "Dedicated onboarding manager & custom driver safety reporting",
        "Custom SLA & uptime guarantees",
      ],
    },
  ];

  const faqs = [
    {
      q: "How do the fleet capacity tiers work?",
      a: "Starter covers 1–3 trucks for free forever. Professional covers 4–25 trucks at $119/mo (billed annually at $1,428/yr) or $149/mo (monthly). Enterprise covers up to 50 trucks at $279/mo (billed annually at $3,348/yr) or $349/mo (monthly). For fleets with 50+ trucks, custom quotes are available.",
    },
    {
      q: "Can drivers use the starter tier for free?",
      a: "Yes! Small trade teams with 1–3 trucks can use our mobile DVIR checklists and manual maintenance logs completely free forever.",
    },
    {
      q: "What is the Prado Commerce Bridge?",
      a: "When a driver logs a failed DVIR item or an OBD-II engine fault is detected, Prado Fleet automatically matches the vehicle model and recommends replacement parts directly through Prado Commerce.",
    },
    {
      q: "Do I need special hardware to get started?",
      a: "No hardware is needed for Starter mobile DVIR logging. For Pro & Enterprise live GPS and engine diagnostics, we support standard plug-and-play OBD-II telematics dongles.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-slate-900 flex flex-col">
      <MainHeader />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6 md:pt-16 text-center space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-900">
            <Sparkles size={14} className="text-amber-600" /> Transparent B2B Pricing
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            Flexible plans built to scale with your fleet.
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Reduce fuel waste, eliminate unexpected breakdowns, and ensure DOT compliance with software that pays for itself.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${billingCycle === "monthly" ? "text-slate-950" : "text-slate-500"}`}>
              Billed Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === "annual" ? "monthly" : "annual")}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-300 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-400"
              style={{ backgroundColor: billingCycle === "annual" ? "#facc15" : undefined }}
              role="switch"
              aria-checked={billingCycle === "annual"}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-slate-950 shadow-xs ring-0 transition duration-200 ease-in-out ${
                  billingCycle === "annual" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === "annual" ? "text-slate-950" : "text-slate-500"}`}>
              Billed Annually
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Save 20%
              </span>
            </span>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-3 lg:items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all ${
                  plan.popular
                    ? "border-2 border-amber-400 bg-white shadow-xl ring-1 ring-amber-400/20"
                    : "border border-slate-200 bg-white shadow-sm hover:shadow-md"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-950 shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-950">{plan.name}</h3>
                    {!plan.popular && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 font-medium">{plan.target}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-slate-950">
                      {billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{plan.priceSubtext}</span>
                  </div>

                  <hr className="my-6 border-slate-100" />

                  <ul className="space-y-3 text-xs text-slate-700">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-amber-500" />
                        <span className={i === 0 && plan.features[0].includes("plus:") ? "font-bold text-slate-950" : ""}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    href={plan.ctaHref}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-98 ${plan.ctaStyle}`}
                  >
                    {plan.ctaText} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Value Proposition Banner */}
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-800 shrink-0">
                  <Truck size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">Zero Hardware Lock-In</h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Use your drivers&apos; existing smartphones for DVIR checklists or plug in standard OBD-II telematics dongles.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800 shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">DOT & OSHA Compliant</h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Digital signatures, timestamped audit logs, and photo defect uploads keep your fleet inspection-ready.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-800 shrink-0">
                  <Wrench size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">Prado Commerce Bridge</h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Automatically source replacement parts when engine faults occur or DVIR inspections flag defects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Everything you need to know about Prado Fleet pricing and plans.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-1.5">
                <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                  <HelpCircle size={16} className="text-amber-500 shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Prado Systems. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="font-medium text-slate-950 underline">
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
