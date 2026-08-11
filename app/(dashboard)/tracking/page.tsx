"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Navigation, Radio, Truck } from "lucide-react";
import LiveGpsMap from "@/components/maps/LiveGpsMap";

type Vehicle = {
  id: string;
  name: string;
  driver: string;
  status: "moving" | "idle" | "alert";
  speed: number;
  destination: string;
  lat: number;
  lng: number;
};

export default function TrackingPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLiveLocations = async () => {
    try {
      const res = await fetch("/api/telematics/location");
      if (res.ok) {
        const data = await res.json();
        if (data.vehicles && Array.isArray(data.vehicles)) {
          setVehicles(data.vehicles);
        }
      }
    } catch (err) {
      console.error("[TrackingPage] Failed to fetch live locations from Supabase:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch from Supabase
    fetchLiveLocations();

    // Poll telematics API every 3s to reflect live driver smartphone GPS streams in Supabase
    const interval = setInterval(fetchLiveLocations, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <MapPin className="text-amber-500" size={22} />
            Real-Time Fleet Telematics & GPS Stream
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Live GPS tracking, geofence site verification, and real-time driver smartphone telemetry stream.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
            <Radio size={14} className="text-amber-500 animate-pulse" /> Live Telematics Stream
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Vehicles ({vehicles.length})
            </h2>
            <span className="text-[10px] font-medium text-emerald-600">
              Live Fleet Sync
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl border border-slate-200 bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
              No active vehicle telemetry found.
            </div>
          ) : (
            vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicleId(vehicle.id)}
                className={`cursor-pointer space-y-2 rounded-xl border p-4 shadow-2xs transition-all ${
                  selectedVehicleId === vehicle.id
                    ? "border-amber-400 bg-amber-50/60 shadow-md ring-2 ring-amber-400/30"
                    : "border-slate-200 bg-white hover:border-amber-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Truck size={16} className="text-amber-500" />
                    {vehicle.name}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      vehicle.status === "moving"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : vehicle.status === "alert"
                        ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                    }`}
                  >
                    {vehicle.status === "moving" ? "Moving" : vehicle.status === "alert" ? "Alert" : "Idle"}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>
                    Driver: <strong className="text-slate-800">{vehicle.driver}</strong>
                  </span>
                  <span>
                    Speed: <strong className="text-slate-800">{vehicle.speed} mph</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Navigation size={12} className="text-amber-500" /> {vehicle.destination}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          <LiveGpsMap
            vehicles={vehicles}
            geofences={[
              {
                id: "jobsite-88",
                name: "Site #88 - Metro Center",
                coordinates: [
                  [-96.7935, 32.772],
                  [-96.7866, 32.772],
                  [-96.7866, 32.7671],
                  [-96.7935, 32.7671],
                  [-96.7935, 32.772],
                ],
                fillColor: "rgba(16,185,129,0.16)",
                lineColor: "#34d399",
              },
              {
                id: "yard-west",
                name: "West Yard",
                coordinates: [
                  [-96.809, 32.7817],
                  [-96.8018, 32.7817],
                  [-96.8018, 32.7763],
                  [-96.809, 32.7763],
                  [-96.809, 32.7817],
                ],
                fillColor: "rgba(59,130,246,0.18)",
                lineColor: "#60a5fa",
              },
            ]}
            routePlayback={{
              vehicleId: "truck-04",
              label: "Truck 04 route playback",
              points: [
                [-96.8158, 32.7611],
                [-96.8127, 32.7642],
                [-96.8085, 32.7685],
                [-96.8042, 32.7721],
                [-96.8008, 32.7762],
                [-96.7967, 32.7799],
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
}