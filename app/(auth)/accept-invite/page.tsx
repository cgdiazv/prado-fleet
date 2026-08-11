"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Lock, ShieldCheck, Smartphone, Truck } from "lucide-react";
import Link from "next/link";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete setup.");
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = data.redirectUrl || "/dashboard/driver-portal";
      }, 1200);
    } catch (err: any) {
      console.error("[AcceptInvitePage] Error:", err);
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-600">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Invalid Invitation Link</h2>
        <p className="text-xs text-slate-600">No activation token provided in the URL.</p>
        <Link
          href="/signin"
          className="inline-block rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500"
        >
          Return to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-400 text-slate-950 shadow-md">
          <Smartphone size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-950">Welcome to Prado Fleet</h1>
        <p className="text-xs text-slate-600">Set your secure driver password to activate your account.</p>
      </div>

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3">
          <div className="mx-auto grid size-10 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <h3 className="text-base font-bold text-emerald-950">Password Setup Complete!</h3>
          <p className="text-xs text-emerald-800">Logging you into the Driver Shift Portal...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl text-xs">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-950">
              <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="mb-1 block font-semibold text-slate-700">New Driver Password</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 text-slate-900 outline-none focus:border-amber-400"
              />
              <Lock size={16} className="absolute right-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 text-slate-900 outline-none focus:border-amber-400"
              />
              <ShieldCheck size={16} className="absolute right-3 top-3 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-amber-400 py-3 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {isLoading ? "Activating Account..." : "Set Password & Start Shift"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#f7f7f3] p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-xs text-slate-500">Loading activation form...</div>}>
          <AcceptInviteContent />
        </Suspense>
      </div>
    </div>
  );
}
