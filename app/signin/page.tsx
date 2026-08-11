import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Lock, Mail } from "lucide-react";
import { PasswordInput } from "@/components/auth/PasswordInput";

type SignInPageProps = {
  searchParams?: Promise<{
    error?: string;
    from?: string;
    registered?: string;
    verified?: string;
    email?: string;
  }>;
};

function getSafeRedirect(target?: string) {
  if (!target) {
    return "/dashboard";
  }

  return target.startsWith("/dashboard") ? target : "/dashboard";
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = (await searchParams) ?? {};
  const redirectTo = getSafeRedirect(params.from);
  const defaultEmail = params.email ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f3] px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div>
          <Link
            href="/"
            className="inline-block font-sans text-xl font-bold tracking-tight text-slate-900 transition-colors hover:text-amber-600"
          >
            Prado Fleet
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-600">Continue to your fleet operations dashboard.</p>
        </div>

        {/* Verification Success Banner */}
        {params.verified === "true" && (
          <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs text-emerald-900 shadow-2xs">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-950">Email Verified Successfully!</p>
              <p className="mt-0.5 text-emerald-800">Your account is active. You can now sign in below.</p>
            </div>
          </div>
        )}

        {/* Registration Success Banner */}
        {params.registered === "true" && (
          <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 shadow-2xs">
            <Mail size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <p className="font-bold text-amber-950">Check your email inbox</p>
              <p className="mt-0.5 text-amber-800">
                We sent a verification link to your email. Please confirm your address before signing in.
              </p>
            </div>
          </div>
        )}

        {/* Unverified Email Alert */}
        {params.error === "unverified" && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs text-red-900 shadow-2xs">
            <Lock size={18} className="mt-0.5 shrink-0 text-red-600" />
            <div className="w-full">
              <p className="font-bold text-red-950">Email Verification Required</p>
              <p className="mt-0.5 text-red-800">
                Your email address has not been confirmed yet. Please check your inbox for the link.
              </p>
              <form method="post" action="/api/auth/resend-verification" className="mt-2.5">
                <input type="hidden" name="email" value={defaultEmail} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 font-semibold text-red-900 underline hover:text-red-950"
                >
                  Resend verification email <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Expired Token Alert */}
        {params.error === "expired_token" && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs text-red-900 shadow-2xs">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <p className="font-bold text-red-950">Expired Link</p>
              <p className="mt-0.5 text-red-800">
                Your verification link has expired. Enter your email below to request a new link.
              </p>
            </div>
          </div>
        )}

        {/* Invalid Credentials Alert */}
        {params.error === "credentials" && (
          <div role="alert" className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertTriangle size={16} className="shrink-0 text-red-600" />
            <span>Email or password is incorrect.</span>
          </div>
        )}

        <form method="post" action="/api/auth/signin" className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-500">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={defaultEmail}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-amber-400"
              placeholder="you@company.com"
            />
          </div>

          <PasswordInput
            id="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-500"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          New to Prado Fleet?{" "}
          <Link href="/signup" className="font-medium text-amber-700 hover:text-amber-800">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}