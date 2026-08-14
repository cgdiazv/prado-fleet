import Link from "next/link";
import { MainHeader } from "@/components/MainHeader";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Prado Fleet",
  description: "Privacy policy and data governance practices for Prado Fleet telematics, DVIR, and asset management.",
};

export default function PrivacyPage() {
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
              Data Privacy & Governance
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-xs text-slate-500">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-950">1. Information We Collect</h2>
              <p>
                Prado Fleet collects telematics data, vehicle diagnostics, GPS locations, mobile DVIR inspection records, driver profiles, and equipment log entries to provide operational visibility and fleet safety metrics.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-950">2. How Data Is Used</h2>
              <p>
                We use collected information strictly to enable real-time vehicle tracking, process DOT/OSHA compliant DVIR checklists, generate automated maintenance work orders, and compute fleet efficiency analytics.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-950">3. Telematics & Location Services</h2>
              <p>
                GPS position data is broadcast strictly during active driver shifts when enabled by authorized operators. Location pings are secured via encrypted connections and stored according to industry audit retention standards.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-950">4. Data Protection & Encryption</h2>
              <p>
                All account credentials, session cookies, and database entries are encrypted in transit via TLS 1.3 and at rest using enterprise database infrastructure.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-950">5. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or wish to request data updates, please contact our support team at{" "}
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
            <Link href="/privacy" className="font-medium text-slate-900 underline">
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
