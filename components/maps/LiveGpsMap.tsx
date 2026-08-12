"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MapPin, Navigation2, Pause, Play, Radio, RotateCcw, ShieldAlert } from "lucide-react";

export type LiveVehiclePin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "moving" | "idle" | "alert";
  driver?: string;
  speed?: number;
  destination?: string;
};

type LiveGpsMapProps = {
  vehicles: LiveVehiclePin[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  geofences?: GeofenceZone[];
  routePlayback?: RoutePlayback;
};

export type GeofenceZone = {
  id: string;
  name: string;
  coordinates: [number, number][];
  fillColor?: string;
  lineColor?: string;
};

export type RoutePlayback = {
  vehicleId: string;
  points: [number, number][];
  label?: string;
};

const DEFAULT_CENTER: [number, number] = [-96.797, 32.7767];
const DEFAULT_GEOFENCES: GeofenceZone[] = [
  {
    id: "yard-1",
    name: "West Yard",
    coordinates: [
      [-96.8085, 32.7822],
      [-96.802, 32.7822],
      [-96.802, 32.7766],
      [-96.8085, 32.7766],
      [-96.8085, 32.7822],
    ],
    fillColor: "rgba(59,130,246,0.18)",
    lineColor: "#60a5fa",
  },
  {
    id: "jobsite-88",
    name: "Site #88 - Metro Center",
    coordinates: [
      [-96.7926, 32.7718],
      [-96.7868, 32.7718],
      [-96.7868, 32.7672],
      [-96.7926, 32.7672],
      [-96.7926, 32.7718],
    ],
    fillColor: "rgba(16,185,129,0.16)",
    lineColor: "#34d399",
  },
];

const DEFAULT_ROUTE_PLAYBACK: RoutePlayback = {
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
};

export default function LiveGpsMap({ vehicles, center = DEFAULT_CENTER, zoom = 9, className, geofences = DEFAULT_GEOFENCES, routePlayback = DEFAULT_ROUTE_PLAYBACK }: LiveGpsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const playbackMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);

  const hasToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);

  const routeCoordinates = useMemo(
    () => vehicles.slice(0, 3).map((vehicle) => [vehicle.lng, vehicle.lat] as [number, number]),
    [vehicles],
  );

  useEffect(() => {
    if (!hasToken || !mapContainerRef.current || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center,
      zoom,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      mapRef.current = map;
      setMapReady(true);

      const geofenceFeatures = geofences.map((geofence) => ({
        type: "Feature" as const,
        properties: {
          id: geofence.id,
          name: geofence.name,
          fillColor: geofence.fillColor ?? "rgba(96,165,250,0.18)",
          lineColor: geofence.lineColor ?? "#60a5fa",
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [geofence.coordinates],
        },
      }));

      map.addSource("fleet-geofences", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: geofenceFeatures,
        },
      });

      map.addLayer({
        id: "fleet-geofences-fill",
        type: "fill",
        source: "fleet-geofences",
        paint: {
          "fill-color": ["get", "fillColor"],
          "fill-opacity": 1,
        },
      });

      map.addLayer({
        id: "fleet-geofences-outline",
        type: "line",
        source: "fleet-geofences",
        paint: {
          "line-color": ["get", "lineColor"],
          "line-width": 2,
        },
      });

      if (routePlayback.points.length > 1) {
        map.addSource("fleet-route-playback", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: routePlayback.points.slice(0, 1),
            },
          },
        });

        map.addLayer({
          id: "fleet-route-playback-line",
          type: "line",
          source: "fleet-route-playback",
          paint: {
            "line-color": "#f59e0b",
            "line-width": 4,
            "line-opacity": 0.95,
          },
        });

        playbackMarkerRef.current = new mapboxgl.Marker({ color: "#fbbf24" })
          .setLngLat(routePlayback.points[0])
          .setPopup(new mapboxgl.Popup({ offset: 16 }).setText(routePlayback.label ?? "Route playback"))
          .addTo(map);
      }
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      playbackMarkerRef.current?.remove();
      playbackMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [center, hasToken, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();

    vehicles.forEach((vehicle) => {
      const markerElement = document.createElement("div");
      markerElement.className = `h-3.5 w-3.5 rounded-full border-2 border-slate-950 shadow-lg ${
        vehicle.status === "alert"
          ? "bg-rose-500"
          : vehicle.status === "idle"
          ? "bg-amber-400"
          : "bg-amber-500"
      }`;

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([vehicle.lng, vehicle.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 18 }).setHTML(
            `<div style="color:#e2e8f0;font-family:ui-sans-serif,system-ui;font-size:12px;line-height:1.4;">
              <strong>${vehicle.name}</strong><br />
              ${vehicle.driver ? `Driver: ${vehicle.driver}<br />` : ""}
              ${vehicle.speed !== undefined ? `Speed: ${vehicle.speed} mph<br />` : ""}
              ${vehicle.destination ? `Destination: ${vehicle.destination}` : ""}
            </div>`,
          ),
        )
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([vehicle.lng, vehicle.lat]);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 80, maxZoom: 12, duration: 800 });
    }

    if (map.getSource("fleet-route")) {
      map.removeLayer("fleet-route-line");
      map.removeSource("fleet-route");
    }

    if (routeCoordinates.length > 1) {
      map.addSource("fleet-route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
          },
          properties: {},
        },
      });

      map.addLayer({
        id: "fleet-route-line",
        type: "line",
        source: "fleet-route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#60a5fa",
          "line-width": 4,
          "line-opacity": 0.9,
        },
      });
    }
  }, [routeCoordinates, vehicles, mapReady]);

  useEffect(() => {
    if (!isPlaying || routePlayback.points.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setPlaybackIndex((currentIndex) => (currentIndex >= routePlayback.points.length - 1 ? 0 : currentIndex + 1));
    }, 1200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPlaying, routePlayback.points.length]);

  useEffect(() => {
    const map = mapRef.current;
    const playbackPoint = routePlayback.points[playbackIndex];

    if (!map || !playbackPoint) {
      return;
    }

    playbackMarkerRef.current?.setLngLat(playbackPoint);

    const source = map.getSource("fleet-route-playback") as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: routePlayback.points.slice(0, playbackIndex + 1),
        },
      });
    }
  }, [playbackIndex, routePlayback.points]);

  const playbackStatus = routePlayback.points.length > 0 ? `${playbackIndex + 1}/${routePlayback.points.length}` : "0/0";

  function resetPlayback() {
    setIsPlaying(false);
    setPlaybackIndex(0);
  }

  if (!hasToken) {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 ${className ?? ""}`}>
        <div className="flex min-h-[480px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,1),_rgba(250,250,247,1))] p-6 text-center">
          <div className="max-w-md space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600">
              <MapPin size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Mapbox token required</h3>
            <p className="text-sm text-slate-600">
              Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to render the live GPS map. The component is already wired for markers, route paths, and geofence-ready overlays.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Radio size={14} className="text-amber-500" /> Live tracking shell loaded
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 ${className ?? ""}`}>
      <div className="absolute left-4 top-4 z-10 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-600 backdrop-blur">
        <span className="mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
        {vehicles.length} vehicles tracked
      </div>
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-2 py-1 backdrop-blur shadow-sm shadow-slate-200/40">
        <button
          type="button"
          onClick={() => setIsPlaying((playing) => !playing)}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-amber-50"
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />} {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={resetPlayback}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-amber-50"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>
      <div ref={mapContainerRef} className="h-[480px] w-full" />
      {!mapReady && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70 text-sm text-slate-600">
          Initializing live GPS map...
        </div>
      )}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-600 backdrop-blur">
        <ShieldAlert size={12} className="text-amber-500" /> Geofence overlays ready
        <Navigation2 size={12} className="text-amber-500" /> Route breadcrumbs enabled
        <span className="border-l border-slate-200 pl-2 text-slate-500">{playbackStatus}</span>
      </div>
    </div>
  );
}