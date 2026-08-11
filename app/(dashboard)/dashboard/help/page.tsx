"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Fuel,
  HelpCircle,
  LifeBuoy,
  Mail,
  MapPin,
  Package,
  Send,
  ShieldCheck,
  Smartphone,
  Truck,
  Users,
  Wrench,
} from "lucide-react";

type DocSection = {
  id: string;
  title: string;
  icon: any;
  summary: string;
  details: string[];
};

const docSections: DocSection[] = [
  {
    id: "overview",
    title: "Executive Operations Command Center",
    icon: BarChart3,
    summary: "Real-time dashboard computing active fleet health, cost/mile, safety scores, and urgent maintenance alerts.",
    details: [
      "Active Fleet Status: Live count of vehicles operating vs. trucks in the maintenance shop.",
      "Pending DVIR Alerts: Aggregates driver-flagged safety defects requiring immediate attention.",
      "Fleet Safety Score: Real-time DOT inspection pass rate percentage.",
      "Avg Cost / Mile: Dynamically calculated from total fuel purchases + shop repair tickets.",
      "Live Defect Banner: Highlights critical safety warnings with 1-click escalation shortcuts.",
    ],
  },
  {
    id: "driver-portal",
    title: "Driver Mobile Shift Portal",
    icon: Smartphone,
    summary: "Mobile-first interface for drivers to manage shift clocking, broadcasting live GPS telematics, submitting daily DVIRs, and logging fuel.",
    details: [
      "Shift Controls: Clock ON DUTY or OFF DUTY to update dispatcher status.",
      "Live Telematics Broadcast: Streams real-time GPS coordinates, speed, and accuracy to the dispatcher tracking map.",
      "Pre-Trip & Post-Trip DVIR: Mandatory DOT safety checklist covering brakes, tires, lights, and steering with digital signature.",
      "Log Fuel Purchase: Mobile form to record gallons, total cost, and odometer reading.",
    ],
  },
  {
    id: "tracking",
    title: "Live Tracking Map",
    icon: MapPin,
    summary: "Interactive fleet map rendering real-time vehicle GPS positions, telematics statuses, and speed monitoring.",
    details: [
      "Real-time Telematics: View active vehicles streaming live GPS locations.",
      "Status Indicators: Green (Moving), Amber (Idle), Red (Alert / Speeding).",
      "Vehicle Info Drawer: Click any vehicle marker to view assigned driver, speed, and last ping timestamp.",
    ],
  },
  {
    id: "dvir",
    title: "DVIR & Inspection Audit Hub",
    icon: ClipboardCheck,
    summary: "Compliance repository for safety directors and shop mechanics to review driver inspections and sign off on defect repairs.",
    details: [
      "Inspection History: Search and filter all Pre-Trip and Post-Trip DVIR submissions.",
      "Defect Escalation: Click 'Escalate to Maintenance' to convert driver defects into shop work orders.",
      "Mechanic Sign-Off: Certify vehicle safety repairs prior to returning trucks to service.",
    ],
  },
  {
    id: "drivers",
    title: "Drivers & Personnel Directory",
    icon: Users,
    summary: "Manage commercial driver profiles, CDL license expirations, duty statuses, and truck assignments in Supabase.",
    details: [
      "Add / Edit Drivers: Register new commercial drivers with contact info and license numbers.",
      "Vehicle Assignments: Link drivers to dedicated fleet trucks.",
      "Duty Status Tracking: Monitor ON_DUTY, ON_ROUTE, and OFF_DUTY statuses.",
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance & Shop Repairs",
    icon: Wrench,
    summary: "Create work order tickets, track repair progress, and record repair expenses for total cost of ownership analysis.",
    details: [
      "Work Order Management: Track OPEN, IN_PROGRESS, and COMPLETED repair tickets.",
      "Parts & Labor Costs: Record repair costs that feed into cost-per-mile analytics.",
    ],
  },
  {
    id: "assets",
    title: "Assets & Tool Management",
    icon: Package,
    summary: "Register and track commercial trailers, heavy equipment, power tools, and current storage/job site locations.",
    details: [
      "Truck & Asset Registry: Maintain serial numbers, categories, and vehicle assignments.",
      "Job Location Tracking: Record current depot yard or job site locations for tools and machinery.",
    ],
  },
  {
    id: "fuel",
    title: "Fuel & Expense Analytics",
    icon: Fuel,
    summary: "Track fleet fuel card transactions, total gallons refueled, and operating expense logs.",
    details: [
      "Fuel Spend Summary: Real-time calculation of total spend and gallons refueled.",
      "Driver Log Sync: Automatically ingests fuel entries logged by drivers in the mobile portal.",
    ],
  },
];

export default function HelpPage() {
  const [openSection, setOpenSection] = useState<string>("overview");

  // Support Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "Technical Support",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? "" : id));
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit support ticket.");
      }

      setSuccessMessage(
        data.message || "Your support ticket has been sent to support@pradofleet.com! Our team will respond shortly."
      );
      setFormData({
        name: "",
        email: "",
        category: "Technical Support",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      console.error("[HelpPage] Support ticket submit error:", err);
      setErrorMessage(err.message || "An error occurred while submitting your support ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold text-slate-900">
          <HelpCircle className="text-amber-500" size={26} />
          Help & Platform Documentation
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Explore complete guidebooks for Prado Fleet modules or submit a support ticket directly to support@pradofleet.com.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Documentation Guidebook */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <LifeBuoy size={18} className="text-amber-500" />
              Module Guidebooks
            </h2>
            <span className="text-xs font-semibold text-slate-500">8 Modules Documented</span>
          </div>

          <div className="space-y-3">
            {docSections.map((sec) => {
              const isOpen = openSection === sec.id;
              const IconComp = sec.icon;

              return (
                <div
                  key={sec.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.id)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-amber-100 p-2.5 text-slate-950 shrink-0">
                        <IconComp size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-950">{sec.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{sec.summary}</p>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-amber-50/40 p-4 text-xs space-y-2">
                      <p className="font-semibold text-slate-800">{sec.summary}</p>
                      <ul className="space-y-1.5 pt-1 text-slate-600 list-disc list-inside">
                        {sec.details.map((item, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Support Ticket Form */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-950">
                <Mail size={20} className="text-amber-500" />
                Submit Support Ticket
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Dispatches a ticket directly to <span className="font-semibold text-slate-800">support@pradofleet.com</span>.
              </p>
            </div>

            {successMessage && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-950">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-950">
                <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate-700">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Support Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-semibold text-slate-800 outline-none focus:border-amber-400"
                >
                  <option value="Technical Support">Technical Support / Bug Report</option>
                  <option value="Driver Telematics">Driver Telematics & GPS</option>
                  <option value="DVIR Compliance">DVIR Compliance & DOT</option>
                  <option value="Account & Billing">Account & Organization</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief summary of issue"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Ticket Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your question or issue in detail..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-md transition-all active:scale-98 disabled:opacity-50"
              >
                <Send size={15} />
                {isSubmitting ? "Sending Ticket..." : "Submit Ticket to support@pradofleet.com"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
