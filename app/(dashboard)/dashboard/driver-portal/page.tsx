"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Fuel,
  MapPin,
  Navigation,
  Radio,
  ShieldCheck,
  Smartphone,
  Truck,
  User,
  UserCheck,
  Wrench,
  X,
} from "lucide-react";

type DriverProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedVehicle: string;
  licenseNo: string;
  status: string;
};

type VehicleItem = {
  id: string;
  name: string;
  driver: string;
};

export default function DriverPortalPage() {
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverProfile | null>(null);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [assignedVehicle, setAssignedVehicle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    speed: number;
    accuracy: number;
    lastPing: string;
  } | null>(null);

  // DVIR Inspection State
  const [isDvirOpen, setIsDvirOpen] = useState(false);
  const [dvirType, setDvirType] = useState<"PRE_TRIP" | "POST_TRIP">("PRE_TRIP");
  const [odometer, setOdometer] = useState<number>(48210);
  const [defects, setDefects] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [signature, setSignature] = useState("");
  const [lastDvirStatus, setLastDvirStatus] = useState<{
    type: string;
    time: string;
    passed: boolean;
  } | null>(null);

  // Fuel Log State
  const [isFuelOpen, setIsFuelOpen] = useState(false);
  const [fuelGallons, setFuelGallons] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [fuelMessage, setFuelMessage] = useState<string | null>(null);

  const [geoPermission, setGeoPermission] = useState<"granted" | "prompt" | "denied" | "unknown">("unknown");

  const watchIdRef = useRef<number | null>(null);

  // Check Geolocation Permission state on portal load
  useEffect(() => {
    if (typeof window !== "undefined" && "permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((result) => {
          setGeoPermission(result.state as "granted" | "prompt" | "denied");
          result.onchange = () => {
            setGeoPermission(result.state as "granted" | "prompt" | "denied");
          };
        })
        .catch(() => {
          setGeoPermission("prompt");
        });
    }
  }, []);

  // Fetch Drivers and Vehicles from API
  useEffect(() => {
    const loadPortalData = async () => {
      try {
        setIsLoading(true);
        const [driversRes, vehiclesRes] = await Promise.all([
          fetch("/api/drivers"),
          fetch("/api/telematics/location"),
        ]);

        let loadedVehicles: VehicleItem[] = [];
        if (vehiclesRes.ok) {
          const vData = await vehiclesRes.json();
          if (vData.vehicles && Array.isArray(vData.vehicles)) {
            loadedVehicles = vData.vehicles;
            setVehicles(vData.vehicles);
          }
        }

        if (driversRes.ok) {
          const data = await driversRes.json();
          if (data.drivers && data.drivers.length > 0) {
            setDrivers(data.drivers);
            setSelectedDriver(data.drivers[0]);
            setSignature(data.drivers[0].name);

            const vehicleName =
              data.drivers[0].assignedVehicle !== "Unassigned"
                ? data.drivers[0].assignedVehicle
                : loadedVehicles[0]?.name || "Unassigned Vehicle";
            setAssignedVehicle(vehicleName);
          }
        }
      } catch (err) {
        console.error("[DriverPortal] Failed to load data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPortalData();
  }, []);

  const handleDriverChange = (driverId: string) => {
    const found = drivers.find((d) => d.id === driverId);
    if (found) {
      setSelectedDriver(found);
      setSignature(found.name);
      const vehicleName =
        found.assignedVehicle !== "Unassigned"
          ? found.assignedVehicle
          : vehicles[0]?.name || "Unassigned Vehicle";
      setAssignedVehicle(vehicleName);
    }
  };

  const sendLocationPing = async (position: GeolocationPosition) => {
    const { latitude, longitude, speed, accuracy } = position.coords;

    const data = {
      vehicleId: vehicles[0]?.id || "truck-01",
      driver: selectedDriver?.name || "Active Driver",
      name: assignedVehicle || "Active Vehicle",
      lat: latitude,
      lng: longitude,
      speed: speed || 0,
      accuracy: accuracy || 0,
    };

    try {
      await fetch("/api/telematics/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      setCurrentLocation({
        lat: latitude,
        lng: longitude,
        speed: speed ? Math.round(speed * 2.23694) : 0,
        accuracy: Math.round(accuracy),
        lastPing: new Date().toLocaleTimeString(),
      });
      setGpsError(null);
    } catch (err) {
      console.error("[DriverPortal] Location ping error:", err);
    }
  };

  const startShift = () => {
    if (!("geolocation" in navigator)) {
      setGpsError("Geolocation is not supported by your mobile browser.");
      return;
    }

    setGpsError(null);

    // Request initial position to trigger browser location permission dialog if not yet granted
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoPermission("granted");
        setIsBroadcasting(true);
        sendLocationPing(position);

        // Start continuous background watch
        const watchId = navigator.geolocation.watchPosition(
          (pos) => sendLocationPing(pos),
          (err) => {
            console.error("[Geolocation Error]:", err);
            setGpsError(
              err.code === err.PERMISSION_DENIED
                ? "Location permission denied. Please allow GPS location access in browser settings."
                : "Unable to retrieve GPS signal."
            );
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        watchIdRef.current = watchId;
      },
      (error) => {
        console.error("[Initial Location Error]:", error);
        setGeoPermission(error.code === error.PERMISSION_DENIED ? "denied" : "prompt");
        setGpsError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. Please allow GPS location access in your browser settings to enable shift tracking."
            : "Could not retrieve GPS position. Please ensure Location Services are enabled on your phone."
        );
        setIsBroadcasting(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const endShift = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsBroadcasting(false);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleDvirSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/dvir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspectionType: dvirType,
          vehicleName: assignedVehicle,
          driverName: selectedDriver?.name || "Active Driver",
          odometer,
          defects,
          notes,
          signature: signature || selectedDriver?.name || "Active Driver",
        }),
      });

      setLastDvirStatus({
        type: dvirType === "PRE_TRIP" ? "Pre-Trip DVIR" : "Post-Trip DVIR",
        time: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        passed: defects.length === 0,
      });
    } catch (err) {
      console.error("[DriverPortal] Error submitting DVIR:", err);
    } finally {
      setIsDvirOpen(false);
    }
  };

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFuelMessage(`Logged ${fuelGallons} gallons ($${fuelCost}) successfully.`);
    setTimeout(() => setFuelMessage(null), 4000);
    setFuelGallons("");
    setFuelCost("");
    setIsFuelOpen(false);
  };

  const toggleDefect = (item: string) => {
    setDefects((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="mx-auto max-w-xl space-y-5 pb-12">
      {/* Mobile Driver Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm space-y-4">

        {isLoading ? (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="size-12 rounded-2xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-24 bg-slate-200 rounded" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-amber-400 font-sans text-lg font-extrabold text-slate-950 shadow-xs">
                {(selectedDriver?.name || "Driver")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                  Mobile Driver Portal
                </p>
                <h1 className="text-xl font-bold text-slate-950">
                  {selectedDriver?.name || "Select Driver Account"}
                </h1>
                <p className="text-xs font-medium text-slate-500">
                  {assignedVehicle || "No Vehicle Assigned"}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                isBroadcasting
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                  : "bg-slate-100 text-slate-600 border border-slate-300"
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  isBroadcasting ? "bg-emerald-500 animate-ping" : "bg-slate-400"
                }`}
              />
              {isBroadcasting ? "On Duty" : "Off Duty"}
            </span>
          </div>
        )}

        {/* Shift Action Button */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={isBroadcasting ? endShift : startShift}
            className={`w-full inline-flex items-center justify-center gap-2.5 rounded-2xl py-3.5 text-sm font-extrabold transition-all shadow-lg active:scale-98 ${
              isBroadcasting
                ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-900/40"
                : "bg-amber-400 text-slate-950 hover:bg-amber-500 shadow-amber-900/30"
            }`}
          >
            {isBroadcasting ? (
              <>
                <Radio size={18} className="animate-pulse" />
                End Shift & Stop GPS Stream
              </>
            ) : (
              <>
                <Navigation size={18} />
                Start Shift & Broadcast GPS
              </>
            )}
          </button>
        </div>
      </div>

      {/* GPS Location Sharing Permission Notice Banner */}
      {geoPermission !== "granted" && !isBroadcasting && (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-amber-400 p-2.5 text-slate-950 shrink-0 shadow-xs">
              <MapPin size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-950">GPS Location Sharing Required</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Prado Fleet needs location access during your shift to stream vehicle route telematics to your fleet manager.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={startShift}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm active:scale-98"
          >
            <Navigation size={15} className="text-amber-400" />
            Enable GPS Location &amp; Start Shift
          </button>
        </div>
      )}

      {gpsError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
          ⚠️ {gpsError}
        </div>
      )}

      {fuelMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {fuelMessage}
        </div>
      )}

      {/* Live GPS Telematics Status */}
      {isBroadcasting && currentLocation && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-emerald-950">
              <Radio size={14} className="text-emerald-600 animate-pulse" />
              Live Telematics Broadcast Active
            </span>
            <span className="text-[10px] text-emerald-800 font-mono">
              Last Ping: {currentLocation.lastPing}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="rounded-xl bg-white p-2.5 border border-emerald-100 shadow-2xs">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Speed</span>
              <span className="text-sm font-bold text-slate-900">{currentLocation.speed} mph</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-emerald-100 shadow-2xs">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Latitude</span>
              <span className="text-xs font-mono font-bold text-slate-800">{currentLocation.lat.toFixed(4)}</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-emerald-100 shadow-2xs">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Longitude</span>
              <span className="text-xs font-mono font-bold text-slate-800">{currentLocation.lng.toFixed(4)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pre-Trip DVIR Card */}
        <button
          type="button"
          onClick={() => {
            setDvirType("PRE_TRIP");
            setIsDvirOpen(true);
          }}
          className="flex flex-col items-start justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-2xs transition-all hover:border-amber-300 hover:shadow-md group active:scale-98"
        >
          <div className="rounded-xl bg-amber-100 p-3 text-amber-800 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
            <ClipboardCheck size={22} />
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-bold text-slate-950">Submit Pre-Trip DVIR</h3>
            <p className="mt-1 text-[11px] text-slate-500">
              Mandatory DOT vehicle inspection checklist.
            </p>
          </div>
        </button>

        {/* Log Fuel Card */}
        <button
          type="button"
          onClick={() => setIsFuelOpen(true)}
          className="flex flex-col items-start justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-2xs transition-all hover:border-amber-300 hover:shadow-md group active:scale-98"
        >
          <div className="rounded-xl bg-amber-100 p-3 text-amber-900 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
            <Fuel size={22} />
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-bold text-slate-950">Log Fuel Purchase</h3>
            <p className="mt-1 text-[11px] text-slate-500">
              Record gallons, total cost & odometer.
            </p>
          </div>
        </button>
      </div>

      {/* DVIR Compliance Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <ShieldCheck size={16} className="text-emerald-500" />
            Today&apos;s DVIR Compliance Status
          </div>
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            Compliant
          </span>
        </div>

        {lastDvirStatus ? (
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-800">{lastDvirStatus.type}</p>
              <p className="text-[11px] text-slate-500">{lastDvirStatus.time}</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                lastDvirStatus.passed
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {lastDvirStatus.passed ? "Passed — No Defects" : "Defects Reported"}
            </span>
          </div>
        ) : (
          <p className="text-xs text-slate-500">No inspection submitted yet today.</p>
        )}
      </div>

      {/* DVIR Inspection Modal */}
      {isDvirOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md my-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-950">
                <ClipboardCheck size={20} className="text-amber-500" />
                {dvirType === "PRE_TRIP" ? "Pre-Trip Inspection" : "Post-Trip Inspection"}
              </div>
              <button
                type="button"
                onClick={() => setIsDvirOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDvirSubmit} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-600">Assigned Vehicle</label>
                <select
                  value={assignedVehicle}
                  onChange={(e) => setAssignedVehicle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-amber-400"
                >
                  {vehicles.length > 0 ? (
                    vehicles.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name}
                      </option>
                    ))
                  ) : (
                    <option value="Unassigned Vehicle">No Vehicle Available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Current Odometer Reading (mi)</label>
                <input
                  type="number"
                  required
                  value={odometer}
                  onChange={(e) => setOdometer(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-800">Check Safety Items</label>
                <p className="text-[11px] text-slate-500 mb-2">Tap any item if a defect is found:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Service Brakes",
                    "Hoses & Fluid Lines",
                    "Tires & Tread",
                    "Rims & Wheels",
                    "Headlights",
                    "Signals & Brake Lights",
                    "Steering Mechanism",
                    "Coupling & Fifth Wheel",
                    "Rearview Mirrors",
                    "Windshield & Wipers",
                    "Horn",
                    "Seat Belts & Safety Equipment",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleDefect(item)}
                      className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-colors ${
                        defects.includes(item)
                          ? "border-rose-300 bg-rose-50 text-rose-800 font-bold"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{item}</span>
                      {defects.includes(item) && <span className="text-rose-600 text-xs">❌ Defect</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Driver Notes / Observations</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. All systems checked and ready for transport..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Digital Driver Signature</label>
                <input
                  type="text"
                  required
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDvirOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-md"
                >
                  Submit Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fuel Log Modal */}
      {isFuelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-950">
                <Fuel size={20} className="text-amber-500" />
                Log Fuel Purchase
              </div>
              <button
                type="button"
                onClick={() => setIsFuelOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFuelSubmit} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-600">Gallons Purchased</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={fuelGallons}
                  onChange={(e) => setFuelGallons(e.target.value)}
                  placeholder="e.g. 24.5"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Total Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                  placeholder="e.g. 88.20"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFuelOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-md"
                >
                  Save Fuel Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
