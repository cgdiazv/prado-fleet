import Link from "next/link";
import { MainHeader } from "@/components/MainHeader";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Prado Fleet",
  description: "Terms of service and software platform agreement for Prado Fleet telematics and management services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f3] text-slate-900 flex flex-col">
      <MainHeader />

      <main className="flex-1 mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 mb-3">
              Platform Agreement
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-2 text-xs text-slate-500">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-950">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Prado Fleet software services, mobile driver portals, or telematics integrations, you agree to be bound by these Terms of Service and all applicable DOT and OSHA regulations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-950">2. Platform Use & Account Security</h2>
              <p>
                Fleet administrators and authorized commercial drivers are responsible for maintaining confidentiality of account credentials and for all shift operations performed under their account.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-950">3. DVIR & Safety Compliance</h2>
              <p>
                Driver pre-trip and post-trip inspections completed via Prado Fleet must reflect accurate physical condition reviews. Automated maintenance requests created from flagged defects must be reviewed by qualified fleet personnel before returning vehicles to service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-950">4. Service Availability & Telematics</h2>
              <p>
                Prado Systems strives for high availability of real-time GPS tracking and notification services, but is not liable for intermittent cellular coverage interruptions or third-party hardware signal outages.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-950">5. Contact Information</h2>
              <p>
                For questions regarding platform terms or legal notices, please reach out to{" "}
                <a href="mailto:info@pradofleet.com" className="font-semibold text-amber-700 underline">
                  info@pradofleet.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Prado Systems. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="font-medium text-slate-900 underline">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
