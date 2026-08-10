import React from 'react';
import { MapPin, Navigation, Radio, Truck } from 'lucide-react';
import LiveGpsMap from '@/components/maps/LiveGpsMap';

const activeVehicles = [
  { id: 'truck-01', name: 'Truck 01 (Ford F-150)', driver: 'Alex R.', status: 'moving' as const, speed: 42, destination: 'Site #104 - Oak Ridge', lat: 32.7941, lng: -96.8185 },
  { id: 'truck-04', name: 'Truck 04 (Ford F-250)', driver: 'Carlos M.', status: 'alert' as const, speed: 0, destination: 'Site #88 - Metro Center', lat: 32.7683, lng: -96.7967 },
  { id: 'truck-09', name: 'Truck 09 (Ram 3500)', driver: 'David K.', status: 'idle' as const, speed: 0, destination: 'Warehouse Depot B', lat: 32.7422, lng: -96.8309 },
];

export default function TrackingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <MapPin className="text-amber-500" size={22} />
            Real-Time Fleet Telematics
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Live GPS tracking, geofence site verification, and driver behavior overlay.
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
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Vehicles ({activeVehicles.length})
          </h2>
          {activeVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="cursor-pointer space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 transition-colors hover:border-amber-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Truck size={16} className="text-amber-500" />
                  {vehicle.name}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    vehicle.status === 'moving'
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : vehicle.status === 'alert'
                      ? 'border-rose-500/20 bg-rose-500/10 text-rose-500'
                      : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {vehicle.status === 'moving' ? 'Moving' : vehicle.status === 'alert' ? 'Alert' : 'Idle'}
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
          ))}
        </div>

        <div className="lg:col-span-2">
          <LiveGpsMap
            vehicles={activeVehicles}
            geofences={[
              {
                id: 'jobsite-88',
                name: 'Site #88 - Metro Center',
                coordinates: [
                  [-96.7935, 32.772],
                  [-96.7866, 32.772],
                  [-96.7866, 32.7671],
                  [-96.7935, 32.7671],
                  [-96.7935, 32.772],
                ],
                fillColor: 'rgba(16,185,129,0.16)',
                lineColor: '#34d399',
              },
              {
                id: 'yard-west',
                name: 'West Yard',
                coordinates: [
                  [-96.809, 32.7817],
                  [-96.8018, 32.7817],
                  [-96.8018, 32.7763],
                  [-96.809, 32.7763],
                  [-96.809, 32.7817],
                ],
                fillColor: 'rgba(59,130,246,0.18)',
                lineColor: '#60a5fa',
              },
            ]}
            routePlayback={{
              vehicleId: 'truck-04',
              label: 'Truck 04 route playback',
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