import Link from "next/link";
import { PasswordInput } from "@/components/auth/PasswordInput";

type SignUpPageProps = {
  searchParams?: Promise<{ error?: string; from?: string }>;
};

const errorMessages: Record<string, string> = {
  exists: "An account with that email already exists.",
  invalid: "Enter a valid name, email, and password of at least 8 characters.",
  password_mismatch: "Passwords do not match. Please check and try again.",
};

function getSafeRedirect(target?: string) {
  if (!target) {
    return "/dashboard";
  }

  return target.startsWith("/dashboard") ? target : "/dashboard";
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = (await searchParams) ?? {};
  const redirectTo = getSafeRedirect(params.from);

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
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-600">Set up access for your fleet operations workspace.</p>
        </div>

        <form method="post" action="/api/auth/signup" className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          {params.error && errorMessages[params.error] && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessages[params.error]}
            </p>
          )}
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-medium text-slate-500">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-amber-400"
              placeholder="Alex Rivera"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-500">Work email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-amber-400"
              placeholder="ops@company.com"
            />
          </div>
          <PasswordInput
            id="password"
            name="password"
            label="Password"
            placeholder="Create a password"
          />
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm password"
            placeholder="Re-enter your password"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-500"
          >
            Create account
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-amber-700 hover:text-amber-800">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}