// src/app/liff/map/page.tsx
"use client";
import { useState, useEffect } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Search, Filter } from "lucide-react";
import StationCard from "@/components/fuel/StationCard";
import { fetchNearbyStations } from "@/services/thunder-core";
import { Station } from "@/types/fuel";

// Mapping สีตาม Queue Status ใน Dashboard
const trafficColors: Record<string, string> = {
  CLEAR: "#1ca34d", // Green
  MODERATE: "#fbbf24", // Yellow
  HEAVY: "#f97316", // Orange
  GRIDLOCK: "#ef4444", // Red
  UNKNOWN: "#9ca3af", // Gray
};

export default function FuelMapPage() {
  const [mounted, setMounted] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [viewport, setViewport] = useState({
    latitude: 13.7367,
    longitude: 100.5231,
    zoom: 12,
  });

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);

    const loadData = async (lat: number, lng: number) => {
      const data = await fetchNearbyStations(lat, lng);
      setStations(data);
    };

    // ใช้ Geolocation พร้อม Timeout / Error Fallback
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setViewport((v) => ({
            ...v,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
          loadData(pos.coords.latitude, pos.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation failed or denied, using default:", error);
          loadData(13.7367, 100.5231);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      );
    } else {
      loadData(13.7367, 100.5231);
    }
  }, []);

  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-white">
      {/* 1. Search Overlay (ตามดีไซน์ Figma) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex gap-2">
        <div className="flex-1 bg-white shadow-xl rounded-2xl flex items-center px-4 border border-gray-100">
          <Search className="text-gray-400" size={18} />
          <input
            type="text"
            placeholder="ค้นหาปั๊มน้ำมัน..."
            className="w-full p-3 text-sm outline-none"
          />
        </div>
        <button className="bg-white shadow-xl rounded-2xl p-3 border border-gray-100">
          <Filter size={20} />
        </button>
      </div>

      {/* 2. Mapbox Canvas */}
      <div className="absolute inset-0 z-0">
        {mounted && (
          <Map
            initialViewState={viewport}
            mapStyle="mapbox://styles/mapbox/light-v11" // ใช้สไตล์ Light แบบใน Dashboard
            mapboxAccessToken={mapboxAccessToken}
            style={{ width: "100%", height: "100%" }}
            onMove={(evt) => setViewport(evt.viewState)}
          >
            {stations.map((s) => (
              <Marker
                key={s.id}
                latitude={s.latitude}
                longitude={s.longitude}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedStation(s);
                }}
              >
                {/* Custom Pin ตาม Dashboard Legend */}
                <div className="relative group flex items-center justify-center">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform active:scale-125"
                    style={{
                      backgroundColor:
                        trafficColors[s.queue_status || "UNKNOWN"],
                    }}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
              </Marker>
            ))}

            <NavigationControl position="bottom-right" />
          </Map>
        )}
      </div>

      {/* 3. Quick Stats Overlay (เลียนแบบ Dashboard นิดๆ) */}
      <div className="absolute top-20 left-4 z-10 bg-white/80 backdrop-blur p-2 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-1">
          {Object.entries(trafficColors).map(([key, color]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[8px] font-bold text-gray-500 uppercase">
                {key}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Overlay Station Card (Figma Screen 3) */}
      {selectedStation && (
        <div className="absolute bottom-24 left-4 right-4 z-30 animate-in slide-in-from-bottom-4">
          <StationCard
            station={selectedStation}
            onDetail={() => {}}
            onReport={() => {}}
          />
        </div>
      )}
    </main>
  );
}
