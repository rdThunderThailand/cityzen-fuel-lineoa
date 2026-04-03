// src/app/liff/map/page.tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Search, Filter, ChevronUp } from "lucide-react";
import StationCard from "@/components/fuel/StationCard";
import StationDrawer from "@/components/fuel/StationDrawer";
import StationListSheet from "@/components/fuel/StationListSheet";
import FilterSheet from "@/components/fuel/FilterSheet";
import { fetchNearbyStations } from "@/services/thunder-core";
import { Station, FuelStatus, FilterState } from "@/types/fuel";

const STATUS_MAP: Record<
  FuelStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  available: {
    label: "มีบริการ",
    color: "text-green-700",
    bg: "bg-green-100",
    dot: "bg-green-500",
  },
  partial: {
    label: "มีบางชนิด",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
    dot: "bg-yellow-400",
  },
  limited: {
    label: "จำกัด",
    color: "text-orange-700",
    bg: "bg-orange-100",
    dot: "bg-orange-500",
  },
  out_of_service: {
    label: "ไม่มีบริการ",
    color: "text-red-700",
    bg: "bg-red-100",
    dot: "bg-red-500",
  },
};

export default function FuelMapPage() {
  const [mounted, setMounted] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // UI States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isListSheetOpen, setIsListSheetOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    fuels: [],
    statuses: [],
    distance: 10,
  });

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

  // Simple client-side filtering via useMemo (derived during render)
  const filteredStations = useMemo(() => {
    let result = stations;

    if (filters.fuels.length > 0) {
      result = result.filter((s) =>
        s.fuels.some((f) => filters.fuels.includes(f)),
      );
    }

    if (filters.statuses.length > 0) {
      result = result.filter((s) => filters.statuses.includes(s.status));
    }

    if (filters.distance) {
      result = result.filter(
        (s) => s.distance_meters <= filters.distance * 1000,
      );
    }

    return result;
  }, [filters, stations]);

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* 1. Header (Sticky) */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur pb-2 pt-4 px-4 shadow-sm">
        <h1 className="text-lg font-bold text-slate-800 text-center mb-3">
          ⛽ แผนที่น้ำมัน
        </h1>
        <div className="flex gap-2">
          <div className="flex-1 bg-white shadow-sm rounded-2xl flex items-center px-4 border border-gray-100">
            <Search className="text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหาปั๊ม / พื้นที่..."
              className="w-full p-2.5 text-sm outline-none bg-transparent"
            />
          </div>
          <button
            onClick={() => setIsFilterSheetOpen(true)}
            className="bg-white shadow-sm rounded-2xl p-2.5 border border-gray-100 relative"
          >
            <Filter size={20} className="text-slate-700" />
            {(filters.fuels.length > 0 || filters.statuses.length > 0) && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Map Canvas */}
      <div className="absolute inset-0 z-0 pt-28">
        {mounted && (
          <Map
            initialViewState={viewport}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken={mapboxAccessToken}
            style={{ width: "100%", height: "100%" }}
            onMove={(evt) => setViewport(evt.viewState)}
            onClick={() => setSelectedStation(null)} // Click outside to clear selected
          >
            {filteredStations.map((s) => {
              const st = STATUS_MAP[s.status] ?? STATUS_MAP.available;
              return (
                <Marker
                  key={s.id}
                  latitude={s.latitude}
                  longitude={s.longitude}
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedStation(s);
                  }}
                  style={{ zIndex: selectedStation?.id === s.id ? 10 : 1 }}
                >
                  <div
                    className={`relative group flex items-center justify-center cursor-pointer transition-transform duration-300 ${selectedStation?.id === s.id ? "scale-125" : "scale-100 hover:scale-110"}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-[2.5px] border-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center ${st.dot}`}
                    >
                      <div className="w-1.5 h-1.5 bg-white rounded-full opacity-75" />
                    </div>
                  </div>
                </Marker>
              );
            })}

            {/* Top Right Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <GeolocateControl
                position="top-right"
                showAccuracyCircle={false}
                trackUserLocation={true}
              />
              <NavigationControl
                position="top-right"
                showCompass={true}
                showZoom={true}
              />
            </div>
          </Map>
        )}
      </div>

      {/* 3. Status Legend - Collapsible */}
      <div className="absolute top-[132px] left-4 z-10 bg-white/95 backdrop-blur p-2.5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-2">
          {Object.entries(STATUS_MAP).map(([key, st]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
              <span className="text-[10px] font-bold text-gray-600">
                {st.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Overlay Station Card (Screen 3) */}
      {selectedStation && !isDrawerOpen && (
        <div className="absolute bottom-[90px] left-4 right-4 z-30 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <StationCard
            station={selectedStation}
            onDetail={() => setIsDrawerOpen(true)}
            onReport={() => setIsDrawerOpen(true)}
          />
        </div>
      )}

      {/* 5. Bottom Filter Bar / Peek Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-linear-to-t from-white via-white to-transparent pt-8 pb-4 px-4">
          {!selectedStation && (
            <button
              onClick={() => setIsListSheetOpen(true)}
              className="w-full bg-white border border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] rounded-2xl p-4 flex items-center justify-between active:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col text-left">
                <span className="text-xs text-gray-500 font-medium">
                  มุมมองปัจจุบัน
                </span>
                <span className="text-gray-900 font-bold">
                  ปั๊มในบริเวณนี้ {filteredStations.length} จุด
                </span>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600">
                <ChevronUp size={20} />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Modals & Sheets */}
      <StationDrawer
        station={selectedStation}
        mode="detail"
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />

      <StationListSheet
        stations={filteredStations}
        open={isListSheetOpen}
        onOpenChange={setIsListSheetOpen}
        onSelectStation={(station) => {
          setSelectedStation(station);
          // Zoom to station could optionally be added here
          setViewport((prev) => ({
            ...prev,
            latitude: station.latitude,
            longitude: station.longitude,
            zoom: 14,
          }));
        }}
      />

      <FilterSheet
        open={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
        filters={filters}
        onApply={handleApplyFilters}
      />
    </main>
  );
}
