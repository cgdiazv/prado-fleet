"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BellRing,
  Briefcase,
  Check,
  CheckCircle2,
  Copy,
  Globe,
  Key,
  Layers,
  Lock,
  MessageSquare,
  Radio,
  Settings2,
  Share2,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  UserRound,
  X,
  Zap,
} from "lucide-react";

const SURVEY_OPTIONS = [
  { id: "too_expensive", label: "Too expensive / looking for a cheaper alternative" },
  { id: "switched_software", label: "Switched to a different fleet management software" },
  { id: "missing_features", label: "Missing essential features required for my fleet" },
  { id: "hard_to_use", label: "Too complex or difficult to set up" },
  { id: "temporary_project", label: "Temporary project / no longer managing a fleet" },
  { id: "other", label: "Other reason" },
];

export default function SettingsPage() {
  const router = useRouter();

  // Settings State
  const [activeTab, setActiveTab] = useState<"general" | "notifications" | "integrations" | "security" | "danger">("general");
  const [companyName, setCompanyName] = useState("Prado Logistics Corp");
  const [timezone, setTimezone] = useState("America/Chicago (CST)");
  const [savedNotice, setSavedNotice] = useState(false);

  // Ecosystem Integrations State
  const [pradoJobsSync, setPradoJobsSync] = useState(true);
  const [pradoCommerceBridge, setPradoCommerceBridge] = useState(true);
  const [geofenceAutoCheckIn, setGeofenceAutoCheckIn] = useState(true);
  const [webhookApiKey, setWebhookApiKey] = useState("prado_live_wk_89f2a71c4b8e90");
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyKey = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(webhookApiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  // Deletion Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [surveyReason, setSurveyReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Password Change State
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  // Dynamic Session Audit State
  const [auditData, setAuditData] = useState<{
    user: {
      name: string;
      email: string;
      role: string;
      createdAt: string;
      emailVerified: string | null;
    };
    session: {
      id: string;
      createdAt: string;
      expiresAt: string;
    };
  } | null>(null);
  const [clientBrowser, setClientBrowser] = useState<string>("Web Dashboard");

  useEffect(() => {
    // Detect browser environment
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      let browser = "Web Browser";
      if (ua.includes("Chrome")) browser = "Chrome Browser";
      else if (ua.includes("Safari")) browser = "Safari Browser";
      else if (ua.includes("Firefox")) browser = "Firefox Browser";

      let os = "Desktop";
      if (ua.includes("Windows")) os = "Windows OS";
      else if (ua.includes("Mac")) os = "macOS";
      else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS Device";
      else if (ua.includes("Android")) os = "Android Device";

      setClientBrowser(`${browser} on ${os}`);
    }

    // Fetch dynamic audit details from API
    fetch("/api/auth/session-audit")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setAuditData(data);
        }
      })
      .catch((err) => console.error("[Audit Data Error]:", err));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("prado_company_name");
      const savedTz = localStorage.getItem("prado_timezone");
      if (savedName) setCompanyName(savedName);
      if (savedTz) setTimezone(savedTz);
    }
  }, []);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("prado_company_name", companyName);
      localStorage.setItem("prado_timezone", timezone);
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPwd.length < 6) {
      setPwdError("New password must be at least 6 characters long.");
      return;
    }

    if (newPwd !== confirmPwd) {
      setPwdError("New password and confirmation do not match.");
      return;
    }

    try {
      setIsChangingPwd(true);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd,
          confirmNewPassword: confirmPwd,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPwdError(data.error || "Failed to update password.");
        setIsChangingPwd(false);
        return;
      }

      setPwdSuccess("Your password has been updated successfully.");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      console.error("[Settings] Change password error:", err);
      setPwdError("An unexpected error occurred. Please try again.");
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (!surveyReason) {
      setDeleteError("Please select a reason for leaving.");
      return;
    }

    if (confirmText.trim().toUpperCase() !== "DELETE") {
      setDeleteError("Please type DELETE to confirm account removal.");
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: surveyReason,
          feedback,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || "Failed to delete account.");
        setIsDeleting(false);
        return;
      }

      // Redirect to signin with deleted confirmation
      router.push(data.redirectUrl || "/signin?deleted=true");
    } catch (err) {
      console.error("[Settings] Account deletion failed:", err);
      setDeleteError("An unexpected error occurred. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Administration</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Fleet Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Manage workspace settings, alerting thresholds, user security, and account preferences.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 border-b-2 py-3 px-1 transition-colors whitespace-nowrap ${
            activeTab === "general"
              ? "border-amber-400 font-bold text-slate-950"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <UserRound size={16} /> General Preferences
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 border-b-2 py-3 px-1 transition-colors whitespace-nowrap ${
            activeTab === "notifications"
              ? "border-amber-400 font-bold text-slate-950"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BellRing size={16} /> Alerts & Notifications
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center gap-2 border-b-2 py-3 px-1 transition-colors whitespace-nowrap ${
            activeTab === "integrations"
              ? "border-amber-400 font-bold text-slate-950"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Share2 size={16} /> Ecosystem Integrations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 border-b-2 py-3 px-1 transition-colors whitespace-nowrap ${
            activeTab === "security"
              ? "border-amber-400 font-bold text-slate-950"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Lock size={16} /> Security & Audit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("danger")}
          className={`flex items-center gap-2 border-b-2 py-3 px-1 transition-colors whitespace-nowrap ${
            activeTab === "danger"
              ? "border-rose-500 font-bold text-rose-600"
              : "border-transparent text-slate-500 hover:text-rose-600"
          }`}
        >
          <Trash2 size={16} /> Danger Zone
        </button>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Settings updated successfully.
        </div>
      )}

      {/* TAB 1: General Preferences */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <UserRound size={18} className="text-amber-500" /> Workspace Configuration
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-600">Fleet Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Operating Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-amber-400"
                >
                  <option value="America/Chicago (CST)">America/Chicago (Central)</option>
                  <option value="America/New_York (EST)">America/New_York (Eastern)</option>
                  <option value="America/Denver (MST)">America/Denver (Mountain)</option>
                  <option value="America/Los_Angeles (PST)">America/Los_Angeles (Pacific)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Alerts & Notifications */}
      {activeTab === "notifications" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <BellRing size={18} className="text-amber-500" /> Live Automated Telematics &amp; Safety Alerts
            </h2>
            <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Pipeline Active
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Configure automated dispatch channels when safety defects, speed alerts, or maintenance work orders occur.
          </p>

          <div className="space-y-4 text-xs text-slate-800">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1.5">
              <label className="flex items-center gap-3 font-bold text-slate-900 cursor-pointer">
                <input type="checkbox" defaultChecked className="size-4 accent-amber-400" />
                <span>Instant Email Alerts on DVIR Defect Submissions</span>
              </label>
              <p className="text-[11px] text-slate-500 pl-7 leading-relaxed">
                Automatically emails <strong className="text-slate-800">info@pradofleet.com</strong> when a driver flags a failed inspection, creates an automated maintenance order, and updates vehicle status to MAINTENANCE.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-1.5">
              <label className="flex items-center gap-3 font-bold text-slate-900 cursor-pointer">
                <input type="checkbox" defaultChecked className="size-4 accent-amber-400" />
                <span>Real-Time Speed &amp; OBD-II Telematics Alerts</span>
              </label>
              <p className="text-[11px] text-slate-500 pl-7 leading-relaxed">
                Flags vehicle status as <strong className="text-rose-600 font-semibold">ALERT</strong> in real time on the live GPS map when speed exceeds safety thresholds.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-1.5">
              <label className="flex items-center gap-3 font-bold text-slate-900 cursor-pointer">
                <input type="checkbox" defaultChecked className="size-4 accent-amber-400" />
                <span>Weekly Fleet Fuel Efficiency &amp; Cost-Per-Mile Reports</span>
              </label>
              <p className="text-[11px] text-slate-500 pl-7 leading-relaxed">
                Generates a weekly summary of total gallons logged, fuel expenditure, and vehicle efficiency metrics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Security & Audit */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <form onSubmit={handleChangePassword} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <Lock size={18} className="text-emerald-500" /> Change Password
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Update your account password below. Passwords must be at least 6 characters long.
            </p>

            {pwdError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 flex items-center gap-2">
                <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                {pwdError}
              </div>
            )}

            {pwdSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                {pwdSuccess}
              </div>
            )}

            <div className="space-y-3 text-xs max-w-md">
              <div>
                <label className="mb-1 block font-medium text-slate-700">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700">New Password</label>
                <input
                  type="password"
                  required
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <button
                type="submit"
                disabled={isChangingPwd}
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                <Lock size={14} className="text-amber-400" />
                {isChangingPwd ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </form>

          {/* Security Audit Log & Active Sessions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <ShieldCheck size={18} className="text-amber-500" /> Security Audit Log &amp; Active Sessions
              </h2>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                Encrypted Session TLS 1.3
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time authentication logs, session token validity, and active device environment for your account.
            </p>

            <div className="space-y-2.5 text-xs">
              {/* Card 1: Active Session */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-800 shrink-0">
                    <Lock size={15} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Active Web Dashboard Session</p>
                    <p className="text-[11px] text-slate-500">
                      User: <strong className="text-slate-800">{auditData?.user.email || "Authenticated User"}</strong> • {clientBrowser}
                    </p>
                  </div>
                </div>
                <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Active Now
                </span>
              </div>

              {/* Card 2: User Role & Auth Verification */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3.5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-100 p-2 text-amber-800 shrink-0">
                    <ShieldCheck size={15} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Role &amp; Credentials Verified</p>
                    <p className="text-[11px] text-slate-500">
                      Role: <span className="font-bold text-amber-900 uppercase">{auditData?.user.role || "MANAGER"}</span> • Session token verified
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {auditData?.session.createdAt
                    ? `Issued ${new Date(auditData.session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : "Verified"}
                </span>
              </div>

              {/* Card 3: Account Creation & Audit Standard */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3.5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 text-blue-800 shrink-0">
                    <Key size={15} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Account Security Audit History</p>
                    <p className="text-[11px] text-slate-500">
                      Member registered: {auditData?.user.createdAt ? new Date(auditData.user.createdAt).toLocaleDateString() : "Active Workspace"} • DOT audit compliance active
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">System Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Ecosystem & Telematics Integrations */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          {/* Section 1: Prado Jobs Sync */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#0e9f6e] p-2.5 text-white shadow-sm shadow-emerald-200 shrink-0">
                  <Layers size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                    Prado Jobs Dispatch Sync
                    <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-800">
                      Connected
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Automatically sync vehicle locations, driver shift statuses, and geofence arrival/departure logs to Prado Jobs.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setPradoJobsSync(!pradoJobsSync)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  pradoJobsSync ? "bg-amber-400" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-slate-950 shadow-xs ring-0 transition duration-200 ease-in-out ${
                    pradoJobsSync ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Sub-options for Prado Jobs */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs pt-1">
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 cursor-pointer transition-colors hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={geofenceAutoCheckIn}
                  onChange={(e) => setGeofenceAutoCheckIn(e.target.checked)}
                  disabled={!pradoJobsSync}
                  className="mt-0.5 size-4 accent-amber-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Geofence Auto Check-In</span>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    Automatically update job status to &quot;On Site&quot; when a driver enters jobsite coordinates, and log departure time on exit.
                  </span>
                </div>
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Globe size={14} className="text-amber-600" />
                  Synced Ecosystem Workspace
                </span>
                <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                  Connected to organization account <strong className="text-slate-800">Prado Logistics Corp</strong> (ID: org_prado_df92a).
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Prado Commerce Bridge */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#00b4d8] p-2.5 text-white shadow-sm shadow-cyan-200 shrink-0">
                  <ShoppingBag size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                    Prado Commerce Parts Bridge
                    <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-800">
                      Active
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Match failed DVIR inspection items and engine diagnostic codes to replacement parts for 1-click order fulfillment.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setPradoCommerceBridge(!pradoCommerceBridge)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  pradoCommerceBridge ? "bg-amber-400" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-slate-950 shadow-xs ring-0 transition duration-200 ease-in-out ${
                    pradoCommerceBridge ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When a driver submits a failed DVIR checklist (e.g. low tire pressure, worn brake pads, or check engine light), Prado Fleet queries Prado Commerce inventory for matching vehicle parts and queues an instant work order.
            </p>
          </div>

          {/* Section 3: Telematics Webhook & API Key */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <Radio size={18} className="text-amber-500" /> External Telematics & Dongle Webhooks
            </h2>
            <p className="text-xs text-slate-500">
              Use this endpoint and secret key to ingest telematics data from external OBD-II dongles or third-party GPS providers into Prado Fleet.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate-700">Webhook Endpoint URL</label>
                <input
                  type="text"
                  readOnly
                  value="https://prado-fleet.app/api/webhooks/telematics"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-mono text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Secret Webhook Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookApiKey}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-mono font-bold text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-bold text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
                  >
                    {copiedKey ? (
                      <>
                        <Check size={14} className="text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="text-slate-500" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Danger Zone / Account Deletion */}
      {activeTab === "danger" && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-rose-950 flex items-center gap-2">
                <ShieldAlert size={20} className="text-rose-600" /> Delete Fleet Account
              </h2>
              <p className="text-xs text-rose-800 leading-relaxed">
                Permanently remove your Prado Fleet user profile, driver invitations, workspace settings, and active session tokens.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition-all active:scale-98"
            >
              <Trash2 size={15} /> Delete Account...
            </button>
          </div>
        </div>
      )}

      {/* ACCOUNT DELETION & EXIT SURVEY MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg my-8 space-y-5 rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5 text-base font-bold text-rose-950">
                <AlertTriangle size={22} className="text-rose-600" />
                Delete Prado Fleet Account
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {deleteError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-5 text-xs">
              {/* EXIT SURVEY QUESTION */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-950">
                  Why are you closing your Prado Fleet account?
                </label>
                <p className="text-xs text-slate-500">
                  Please take a moment to select a reason so we can improve our platform for future fleet operators.
                </p>

                <div className="space-y-2 pt-1">
                  {SURVEY_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                        surveyReason === option.id
                          ? "border-rose-300 bg-rose-50/70 text-rose-950 font-bold"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="surveyReason"
                        value={option.id}
                        checked={surveyReason === option.id}
                        onChange={(e) => setSurveyReason(e.target.value)}
                        className="size-4 accent-rose-600"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ADDITIONAL FEEDBACK TEXT AREA */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-slate-400" />
                  Additional Feedback (Optional)
                </label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What could we have done better to keep your business?"
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-rose-400"
                />
              </div>

              {/* CONFIRMATION PASSWORD & TEXT */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div>
                  <label className="mb-1 block font-semibold text-slate-900">
                    Confirm Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold text-rose-950">
                    Type <span className="underline font-mono">DELETE</span> to confirm permanent deletion
                  </label>
                  <input
                    type="text"
                    required
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full rounded-xl border border-rose-300 bg-rose-50/50 px-3.5 py-2.5 font-mono font-extrabold uppercase tracking-wider text-rose-950 outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>Processing Deletion...</>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      Permanently Delete Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}