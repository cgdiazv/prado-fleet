"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  IdCard,
  Mail,
  Phone,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Truck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  role: "Commercial Driver" | "Fleet Manager" | "Lead Technician" | "Dispatcher";
  email: string;
  phone: string;
  assignedVehicle: string;
  licenseNo: string;
  cdlExpiration: string;
  status: "on_duty" | "on_route" | "off_duty";
  inviteAccepted?: string | null;
};

type VehicleItem = {
  id: string;
  name: string;
};

export default function DriversPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [resendingInviteId, setResendingInviteId] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Commercial Driver" as TeamMember["role"],
    assignedVehicle: "Unassigned",
    licenseNo: "",
    cdlExpiration: "",
    status: "off_duty" as TeamMember["status"],
  });

  const fetchPortalData = async () => {
    try {
      setIsLoading(true);
      const [driversRes, vehiclesRes] = await Promise.all([
        fetch("/api/drivers"),
        fetch("/api/telematics/location"),
      ]);

      if (driversRes.ok) {
        const data = await driversRes.json();
        setTeam(data.drivers || []);
      }

      if (vehiclesRes.ok) {
        const vData = await vehiclesRes.json();
        if (vData.vehicles && Array.isArray(vData.vehicles)) {
          setVehicles(vData.vehicles);
        }
      }
    } catch (err) {
      console.error("[DriversPage] Failed to fetch portal data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setErrorMessage(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Commercial Driver",
      assignedVehicle: vehicles[0]?.name || "Unassigned",
      licenseNo: "",
      cdlExpiration: "",
      status: "off_duty",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setErrorMessage(null);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      assignedVehicle: member.assignedVehicle,
      licenseNo: member.licenseNo,
      cdlExpiration: member.cdlExpiration,
      status: member.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setErrorMessage(null);
    setIsSaving(true);

    try {
      if (editingMember) {
        // UPDATE Driver (PUT)
        const res = await fetch("/api/drivers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingMember.id, ...formData }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update driver");
        }

        await fetchPortalData();
        setIsModalOpen(false);
      } else {
        // CREATE Driver (POST)
        const res = await fetch("/api/drivers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create driver");
        }

        await fetchPortalData();
        setIsModalOpen(false);
      }
    } catch (err: any) {
      console.error("[DriversPage] Save driver error:", err);
      setErrorMessage(err.message || "An error occurred while saving the driver.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      const res = await fetch(`/api/drivers?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete driver");
      }

      await fetchPortalData();
    } catch (err: any) {
      console.error("[DriversPage] Delete driver error:", err);
      alert(err.message || "Failed to delete driver from database.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTeam = team.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.assignedVehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Users className="text-amber-500" size={24} />
            Drivers & Fleet Personnel
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Create, edit, assign vehicles, manage CDL licenses, and remove team accounts in Supabase.
          </p>
        </div>

        {inviteMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} />
            {inviteMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={fetchPortalData}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-amber-500" : "text-slate-400"} />
            Refresh
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:bg-amber-500 transition-all active:scale-98"
          >
            <UserPlus size={16} />
            Add Driver / Team Member
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Registered Personnel</p>
            <p className="text-2xl font-bold text-slate-950">{team.length}</p>
          </div>
          <div className="rounded-xl bg-amber-100 p-3 text-amber-800">
            <Users size={20} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">On Duty & Streaming GPS</p>
            <p className="text-2xl font-bold text-amber-600">
              {team.filter((m) => m.status === "on_duty" || m.status === "on_route").length}
            </p>
          </div>
          <div className="rounded-xl bg-amber-100 p-3 text-amber-900">
            <Radio size={20} className="animate-pulse" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">CDL License Compliance</p>
            <p className="text-2xl font-bold text-slate-950">100% Compliant</p>
          </div>
          <div className="rounded-xl bg-blue-100 p-3 text-blue-800">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by driver name, email, role, or assigned vehicle..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        />
      </div>

      {/* Drivers List */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Loading driver directory from Supabase...
        </div>
      ) : filteredTeam.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          No registered drivers found. Click &quot;Add Driver / Team Member&quot; to create a new profile.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredTeam.map((member) => (
            <div
              key={member.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-amber-300 hover:shadow-md space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-amber-100 font-sans text-sm font-bold text-amber-900">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-950">{member.name}</h3>
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {member.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        member.status === "on_duty"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : member.status === "on_route"
                          ? "border-amber-300 bg-amber-50 text-amber-800"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          member.status === "on_duty"
                            ? "bg-emerald-500 animate-ping"
                            : member.status === "on_route"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                        }`}
                      />
                      {member.status === "on_duty"
                        ? "On Duty"
                        : member.status === "on_route"
                        ? "On Route"
                        : "Off Duty"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-amber-500" />
                    <span>
                      Assigned Vehicle: <strong className="text-slate-900">{member.assignedVehicle}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IdCard size={14} className="text-slate-400" />
                    <span>
                      CDL / License #: <strong className="text-slate-900">{member.licenseNo}</strong>
                      {member.cdlExpiration !== "N/A" && (
                        <span className="text-slate-400"> (Expires: {member.cdlExpiration})</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Mail size={12} className="text-slate-400" /> {member.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" /> {member.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                {/* Invite status + resend */}
                <div className="flex items-center gap-2">
                  {!member.inviteAccepted ? (
                    <>
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        <Clock size={10} /> Pending Invite
                      </span>
                      <button
                        type="button"
                        disabled={resendingInviteId === member.id}
                        onClick={async () => {
                          setResendingInviteId(member.id);
                          setInviteMessage(null);
                          try {
                            const res = await fetch("/api/drivers/resend-invite", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ driverId: member.id }),
                            });
                            const data = await res.json();
                            setInviteMessage(data.message || data.error || "Done");
                          } catch {
                            setInviteMessage("Failed to send.");
                          } finally {
                            setResendingInviteId(null);
                            setTimeout(() => setInviteMessage(null), 4000);
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 transition-colors disabled:opacity-50"
                      >
                        <Send size={11} />
                        {resendingInviteId === member.id ? "Sending..." : "Resend Invite"}
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      <CheckCircle2 size={10} /> Account Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(member)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                  >
                    <Edit2 size={13} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingId(member.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md my-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-950">
                {editingMember ? (
                  <>
                    <Edit2 size={20} className="text-amber-500" />
                    Edit Driver Details
                  </>
                ) : (
                  <>
                    <UserPlus size={20} className="text-amber-500" />
                    Add Driver / Team Member
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveMember} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-600">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Work Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. driver@pradofleet.com"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-600">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 000-0000"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-600">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as TeamMember["role"] })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-amber-400"
                  >
                    <option value="Commercial Driver">Commercial Driver</option>
                    <option value="Fleet Manager">Fleet Manager</option>
                    <option value="Lead Technician">Lead Technician</option>
                    <option value="Dispatcher">Dispatcher</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-600">Assigned Vehicle</label>
                  <select
                    value={formData.assignedVehicle}
                    onChange={(e) => setFormData({ ...formData, assignedVehicle: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-amber-400"
                  >
                    <option value="Unassigned">Unassigned</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-600">CDL / License #</label>
                  <input
                    type="text"
                    value={formData.licenseNo}
                    onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                    placeholder="TX-1234567"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Duty Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as TeamMember["status"] })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-amber-400"
                >
                  <option value="off_duty">Off Duty</option>
                  <option value="on_duty">On Duty (Streaming)</option>
                  <option value="on_route">On Route</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-md disabled:opacity-50"
                >
                  {isSaving ? "Saving to Database..." : editingMember ? "Update Driver" : "Save & Register Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-slate-950">
              <div className="rounded-full bg-rose-100 p-2.5 text-rose-600">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold">Delete Driver Account?</h3>
                <p className="text-xs text-slate-500">This action will permanently delete the driver from Supabase.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMember(deletingId)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
