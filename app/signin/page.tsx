import Link from "next/link";
import { PasswordInput } from "@/components/auth/PasswordInput";

type SignInPageProps = {
  searchParams?: Promise<{ from?: string }>;
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f3] px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Prado Fleet</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-600">Continue to your fleet operations dashboard.</p>
        </div>

        <form method="post" action="/api/auth/signin" className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-500">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
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