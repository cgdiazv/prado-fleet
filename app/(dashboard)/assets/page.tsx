"use client";

import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Edit2,
  IdCard,
  Link2,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Truck,
  Wrench,
  X,
} from "lucide-react";

type VehicleItem = {
  id: string;
  name: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  status: string;
  assignedDriver: string;
  assignedDriverId: string | null;
  assetCount: number;
  destination: string;
};

type AssetItem = {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  assignedVehicleId: string | null;
  assignedTo: string;
  jobLocation: string;
};

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<"VEHICLES" | "ASSETS">("VEHICLES");
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Vehicle Modal State
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    name: "",
    make: "Ford",
    model: "F-150",
    year: "2023",
    licensePlate: "",
    vin: "",
    status: "ACTIVE",
  });

  // Asset Modal State
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const [assetFormData, setAssetFormData] = useState({
    name: "",
    category: "Heavy Equipment",
    serialNumber: "",
    assignedVehicleId: "",
    jobLocation: "Depot Yard B",
  });

  const [deletingId, setDeletingId] = useState<{ type: "VEHICLE" | "ASSET"; id: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPortalData = async () => {
    try {
      setIsLoading(true);
      const [vRes, aRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/assets"),
      ]);

      if (vRes.ok) {
        const data = await vRes.json();
        setVehicles(data.vehicles || []);
      }

      if (aRes.ok) {
        const aData = await aRes.json();
        setAssets(aData.assets || []);
      }
    } catch (err) {
      console.error("[AssetsPage] Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  // --- VEHICLE ACTIONS ---
  const openAddVehicleModal = () => {
    setEditingVehicle(null);
    setVehicleFormData({
      name: "",
      make: "Ford",
      model: "F-150",
      year: "2023",
      licensePlate: "",
      vin: "",
      status: "ACTIVE",
    });
    setIsVehicleModalOpen(true);
  };

  const openEditVehicleModal = (v: VehicleItem) => {
    setEditingVehicle(v);
    setVehicleFormData({
      name: v.name,
      make: v.make,
      model: v.model,
      year: String(v.year),
      licensePlate: v.licensePlate,
      vin: v.vin,
      status: v.status,
    });
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleFormData.name) return;

    setIsSaving(true);
    try {
      if (editingVehicle) {
        await fetch("/api/vehicles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingVehicle.id, ...vehicleFormData }),
        });
      } else {
        await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(vehicleFormData),
        });
      }
      await fetchPortalData();
      setIsVehicleModalOpen(false);
    } catch (err) {
      console.error("[AssetsPage] Error saving vehicle:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      await fetch(`/api/vehicles?id=${id}`, { method: "DELETE" });
      await fetchPortalData();
    } catch (err) {
      console.error("[AssetsPage] Error deleting vehicle:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // --- ASSET ACTIONS ---
  const openAddAssetModal = () => {
    setEditingAsset(null);
    setAssetFormData({
      name: "",
      category: "Heavy Equipment",
      serialNumber: "",
      assignedVehicleId: vehicles[0]?.id || "",
      jobLocation: "Depot Yard B",
    });
    setIsAssetModalOpen(true);
  };

  const openEditAssetModal = (a: AssetItem) => {
    setEditingAsset(a);
    setAssetFormData({
      name: a.name,
      category: a.category,
      serialNumber: a.serialNumber,
      assignedVehicleId: a.assignedVehicleId || "",
      jobLocation: a.jobLocation,
    });
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetFormData.name) return;

    setIsSaving(true);
    try {
      if (editingAsset) {
        await fetch("/api/assets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingAsset.id, ...assetFormData }),
        });
      } else {
        await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assetFormData),
        });
      }
      await fetchPortalData();
      setIsAssetModalOpen(false);
    } catch (err) {
      console.error("[AssetsPage] Error saving asset:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await fetch(`/api/assets?id=${id}`, { method: "DELETE" });
      await fetchPortalData();
    } catch (err) {
      console.error("[AssetsPage] Error deleting asset:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.assignedDriver.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.jobLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Package className="text-amber-500" size={24} />
            Fleet Trucks, Assets & Tool Management
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Create, edit, assign, and delete fleet trucks, heavy equipment, trailers, and job site tools in Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPortalData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-amber-500" : "text-slate-400"} />
            Refresh
          </button>

          {activeTab === "VEHICLES" ? (
            <button
              type="button"
              onClick={openAddVehicleModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:bg-amber-500 transition-all active:scale-98"
            >
              <Plus size={16} /> Register New Truck
            </button>
          ) : (
            <button
              type="button"
              onClick={openAddAssetModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:bg-amber-500 transition-all active:scale-98"
            >
              <Plus size={16} /> Register New Tool / Asset
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("VEHICLES")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "VEHICLES"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Truck size={15} />
            Fleet Trucks ({vehicles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ASSETS")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "ASSETS"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Package size={15} />
            Equipment & Tools ({assets.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "VEHICLES"
                ? "Search trucks by name, plate, or driver..."
                : "Search tools by category, serial, or truck assignment..."
            }
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* TAB 1: FLEET TRUCKS */}
      {activeTab === "VEHICLES" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              Loading fleet trucks from Supabase...
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No registered trucks found. Click &quot;Register New Truck&quot; to add a vehicle to your fleet.
            </div>
          ) : (
            filteredVehicles.map((v) => (
              <div
                key={v.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-amber-300 hover:shadow-md space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-amber-100 p-2.5 text-amber-900">
                        <Truck size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-950">{v.name}</h3>
                        <p className="text-xs text-slate-500">
                          {v.year} {v.make} {v.model}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                      {v.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">License Plate:</span>
                      <strong className="font-mono text-slate-900">{v.licensePlate}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Assigned Driver:</span>
                      <strong className="text-slate-900">{v.assignedDriver}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Assigned Equipment:</span>
                      <span className="font-bold text-amber-600">{v.assetCount} Assets Linked</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => openEditVehicleModal(v)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                  >
                    <Edit2 size={13} /> Edit Truck
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingId({ type: "VEHICLE", id: v.id })}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: EQUIPMENT & TOOLS */}
      {activeTab === "ASSETS" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              Loading tools & assets from Supabase...
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No equipment or tools registered yet. Click &quot;Register New Tool / Asset&quot; to add items.
            </div>
          ) : (
            filteredAssets.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-amber-300 hover:shadow-md space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">SN: {item.serialNumber}</span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-950">{item.name}</h3>

                  <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-amber-500 shrink-0" />
                      <span>
                        Assigned to: <strong className="text-slate-900">{item.assignedTo}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-amber-400 shrink-0" />
                      <span>
                        Location: <strong className="text-slate-900">{item.jobLocation}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => openEditAssetModal(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                  >
                    <Edit2 size={13} /> Edit Asset
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingId({ type: "ASSET", id: item.id })}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VEHICLE MODAL */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md my-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-950">
                <Truck size={20} className="text-amber-500" />
                {editingVehicle ? "Edit Fleet Truck" : "Register New Fleet Truck"}
              </div>
              <button
                type="button"
                onClick={() => setIsVehicleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-600">Truck Name / Unit Name</label>
                <input
                  type="text"
                  required
                  value={vehicleFormData.name}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, name: e.target.value })}
                  placeholder="e.g. Truck 01 (Ford F-150)"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-1 block font-medium text-slate-600">Make</label>
                  <input
                    type="text"
                    value={vehicleFormData.make}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, make: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-600">Model</label>
                  <input
                    type="text"
                    value={vehicleFormData.model}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, model: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-600">Year</label>
                  <input
                    type="number"
                    value={vehicleFormData.year}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, year: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-600">License Plate</label>
                  <input
                    type="text"
                    value={vehicleFormData.licensePlate}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, licensePlate: e.target.value })}
                    placeholder="TX-FLT01"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-600">VIN #</label>
                  <input
                    type="text"
                    value={vehicleFormData.vin}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, vin: e.target.value })}
                    placeholder="1FTFW..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-md disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : editingVehicle ? "Update Truck" : "Register Truck"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSET MODAL */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md my-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-950">
                <Package size={20} className="text-amber-500" />
                {editingAsset ? "Edit Tool / Asset" : "Register New Equipment / Tool"}
              </div>
              <button
                type="button"
                onClick={() => setIsAssetModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-600">Equipment / Tool Name</label>
                <input
                  type="text"
                  required
                  value={assetFormData.name}
                  onChange={(e) => setAssetFormData({ ...assetFormData, name: e.target.value })}
                  placeholder="e.g. Commercial Pressure Washer Unit B"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-slate-600">Category</label>
                  <select
                    value={assetFormData.category}
                    onChange={(e) => setAssetFormData({ ...assetFormData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-amber-400"
                  >
                    <option value="Heavy Equipment">Heavy Equipment</option>
                    <option value="Trailer">Trailer</option>
                    <option value="Power Tool">Power Tool</option>
                    <option value="Safety Gear">Safety Gear</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-600">Serial Number</label>
                  <input
                    type="text"
                    value={assetFormData.serialNumber}
                    onChange={(e) => setAssetFormData({ ...assetFormData, serialNumber: e.target.value })}
                    placeholder="PW-99201"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Assigned Truck</label>
                <select
                  value={assetFormData.assignedVehicleId}
                  onChange={(e) => setAssetFormData({ ...assetFormData, assignedVehicleId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-amber-400"
                >
                  <option value="">Unassigned (Depot Yard)</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Job Location</label>
                <input
                  type="text"
                  value={assetFormData.jobLocation}
                  onChange={(e) => setAssetFormData({ ...assetFormData, jobLocation: e.target.value })}
                  placeholder="e.g. Depot Yard B"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-md disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : editingAsset ? "Update Asset" : "Register Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-slate-950">
              <div className="rounded-full bg-rose-100 p-2.5 text-rose-600">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold">
                  Delete {deletingId.type === "VEHICLE" ? "Truck" : "Tool / Asset"}?
                </h3>
                <p className="text-xs text-slate-500">
                  This action will permanently delete this item from your Supabase database.
                </p>
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
                onClick={() =>
                  deletingId.type === "VEHICLE"
                    ? handleDeleteVehicle(deletingId.id)
                    : handleDeleteAsset(deletingId.id)
                }
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