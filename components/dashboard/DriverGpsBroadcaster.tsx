"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Navigation, Radio, RefreshCw, ShieldAlert, Truck } from "lucide-react";

type DriverGpsBroadcasterProps = {
  driverName?: string;
  vehicleId?: string;
};

export function DriverGpsBroadcaster({
  driverName = "Alex Rivera",
  vehicleId = "truck-01",
}: DriverGpsBroadcasterProps) {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    speed: number;
    accuracy: number;
    lastPing: string;
  } | null>(null);

  const watchIdRef = useRef<number | null>(null);

  const sendLocationPing = async (position: GeolocationPosition) => {
    const { latitude, longitude, speed, accuracy } = position.coords;

    const data = {
      vehicleId,
      driver: driverName,
      name: `Unit #${vehicleId.replace(/\D/g, "") || "01"} — Mobile Broadcast`,
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
      console.error("[GPS Stream Error]:", err);
    }
  };

  const startBroadcasting = () => {
    if (!("geolocation" in navigator)) {
      setGpsError("Geolocation is not supported by your mobile browser.");
      return;
    }

    setGpsError(null);
    setIsBroadcasting(true);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        sendLocationPing(position);
      },
      (error) => {
        console.error("[Geolocation Error]:", error);
        setGpsError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. Please allow GPS location access in browser settings."
            : "Unable to retrieve GPS signal."
        );
        setIsBroadcasting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    watchIdRef.current = watchId;
  };

  const stopBroadcasting = () => {
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-xl p-2.5 transition-colors ${
              isBroadcasting ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            <Radio size={20} className={isBroadcasting ? "animate-pulse" : ""} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-950">Mobile Driver GPS Tracker</h3>
            <p className="text-xs text-slate-500">
              Stream your phone&apos;s real-time position directly to Mapbox dispatch.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={isBroadcasting ? stopBroadcasting : startBroadcasting}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-sm ${
            isBroadcasting
              ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200"
              : "bg-amber-400 text-slate-950 hover:bg-amber-500 shadow-amber-200"
          }`}
        >
          {isBroadcasting ? (
            <>
              <Radio size={14} className="animate-pulse" />
              Stop Duty & GPS Stream
            </>
          ) : (
            <>
              <Navigation size={14} />
              Start Shift & Broadcast GPS
            </>
          )}
        </button>
      </div>

      {gpsError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-rose-600" />
          <span>{gpsError}</span>
        </div>
      )}

      {isBroadcasting && currentLocation && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-emerald-950">
              <CheckCircle2 size={15} className="text-emerald-600" />
              Live Telematics Stream Active
            </span>
            <span className="text-[10px] font-medium text-emerald-800">
              Last Ping: {currentLocation.lastPing}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="rounded-lg bg-white p-2 border border-emerald-100">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Latitude</span>
              <span className="font-mono font-bold text-slate-800">{currentLocation.lat.toFixed(5)}</span>
            </div>
            <div className="rounded-lg bg-white p-2 border border-emerald-100">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Longitude</span>
              <span className="font-mono font-bold text-slate-800">{currentLocation.lng.toFixed(5)}</span>
            </div>
            <div className="rounded-lg bg-white p-2 border border-emerald-100">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Speed</span>
              <span className="font-bold text-slate-800">{currentLocation.speed} mph</span>
            </div>
            <div className="rounded-lg bg-white p-2 border border-emerald-100">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">GPS Accuracy</span>
              <span className="font-bold text-emerald-700">±{currentLocation.accuracy}m</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
