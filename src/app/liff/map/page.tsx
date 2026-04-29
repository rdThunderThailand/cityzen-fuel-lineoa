// src/app/liff/map/page.tsx
"use client";
import FilterSheet from "@/components/map/FilterSheet";
import ReportUpdateSheet from "@/components/map/ReportUpdateSheet";
import StationDrawer from "@/components/map/StationDrawer";
import StationListSheet from "@/components/map/StationListSheet";
import { fetchNearbyStations } from "@/services/thunder-core";
import { FilterState, FuelStatus, Station } from "@/types/fuel";
import { ChevronLeft, Filter, Fuel, MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useMemo, useState, useRef } from "react";
import Map, {
  GeolocateControl,
  Marker,
  NavigationControl,
  MapRef,
} from "react-map-gl/mapbox";

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
  
  const mapRef = useRef<MapRef>(null);

  // UI States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isListSheetOpen, setIsListSheetOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false);
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

  const [mapboxAccessToken, setMapboxAccessToken] = useState<string>(
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""
  );
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    // If we already have the token from the environment variable, skip fetching
    if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      return;
    }

    // Fallback to API if env var is missing
    fetch("https://citizen-server.vercel.app/api/mapbox-token")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (data.token) {
          setMapboxAccessToken(data.token);
        } else {
          setTokenError(true);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch mapbox token:", err);
        setTokenError(true);
      });
  }, []);

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
    <main className="fixed inset-0 overflow-hidden bg-gray-50 flex flex-col font-sans">
      {/* 1. Header (Sticky) */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white pb-2 pt-4 px-4 shadow-sm">
        <div className="relative flex items-center justify-center mb-4">
          <button
            onClick={() => window.history.back()}
            className="absolute left-0 p-1"
          >
            <ChevronLeft className="text-gray-600" size={24} />
          </button>
          <h1 className="text-[17px] font-medium text-gray-800">
            แผนที่น้ำมัน
          </h1>
        </div>

        <div className="flex gap-2 mb-3">
          <div className="flex-1 bg-white shadow-sm rounded-xl flex items-center px-3 border border-gray-200">
            <MapPin className="text-gray-400" size={16} />
            <input
              type="text"
              placeholder="ค้นหาปั๊มน้ำมัน"
              className="w-full p-2.5 text-sm outline-none bg-transparent ml-1"
            />
            <button
              onClick={() => setIsFilterSheetOpen(true)}
              className="p-1 relative active:scale-95 transition-transform"
            >
              <Filter size={16} className="text-gray-500" />
              {(filters.fuels.length > 0 || filters.statuses.length > 0) && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Fuel Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button className="shrink-0 px-4 py-1.5 bg-[#34445c] text-white text-sm rounded-full border border-[#34445c]">
            ทั้งหมด
          </button>
          <button className="shrink-0 px-4 py-1.5 bg-white text-gray-600 text-sm rounded-full border border-gray-200">
            ดีเซล
          </button>
          <button className="shrink-0 px-4 py-1.5 bg-white text-gray-600 text-sm rounded-full border border-gray-200">
            เบนซิน
          </button>
          <button className="shrink-0 px-4 py-1.5 bg-white text-gray-600 text-sm rounded-full border border-gray-200">
            แก๊สโซฮอล์
          </button>
        </div>
      </div>

      {/* 2. Map Canvas */}
      <div className="absolute inset-0 z-0 pt-28">
        {!mounted && !tokenError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 pt-28">
            <span className="text-gray-400 font-medium">
              กำลังโหลดแผนที่...
            </span>
          </div>
        )}
        {tokenError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 pt-28">
            <span className="text-red-500 font-medium">
              ไม่สามารถเชื่อมต่อแผนที่ได้ กรุณาลองใหม่อีกครั้ง
            </span>
          </div>
        )}
        {mounted && mapboxAccessToken && (
          <Map
            ref={mapRef}
            initialViewState={viewport}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken={mapboxAccessToken}
            style={{ width: "100%", height: "100%" }}
            onMove={(evt) => setViewport(evt.viewState)}
            onClick={() => setSelectedStation(null)} // Click outside to clear selected
          >
            {filteredStations.map((s) => {
              const st = STATUS_MAP[s.status] ?? STATUS_MAP.available;
              const isSelected = selectedStation?.id === s.id;

              return (
                <Marker
                  key={s.id}
                  latitude={s.latitude}
                  longitude={s.longitude}
                  style={{ zIndex: isSelected ? 10 : 1 }}
                  anchor="bottom"
                >
                  <div
                    className={`relative transition-transform duration-300 ${isSelected ? "scale-110" : "scale-100"}`}
                  >
                    {isSelected ? (
                      // Selected State: Pill badge
                      <div className="flex flex-col items-center drop-shadow-md pb-1.5 relative">
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${st.dot} text-white border-2 border-white relative z-10`}
                        >
                          <Fuel size={14} />
                          <span className="text-xs font-bold whitespace-nowrap">
                            {st.label}
                          </span>
                        </div>
                        <div
                          className={`w-3.5 h-3.5 ${st.dot} rotate-45 border-r-2 border-b-2 border-white absolute bottom-0.5 z-0`}
                        ></div>
                      </div>
                    ) : (
                      // Unselected State: Teardrop pin
                      <div className="flex flex-col items-center drop-shadow-md">
                        <div
                          className={`w-7 h-7 ${st.dot} rounded-full flex items-center justify-center rounded-br-none rotate-45 border-2 border-white`}
                        >
                          <div className="w-2.5 h-2.5 bg-white rounded-full shadow-inner" />
                        </div>
                      </div>
                    )}
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
      <div className="absolute top-[170px] left-4 z-10 bg-white/95 backdrop-blur p-2.5 rounded-xl border border-gray-100 shadow-sm">
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

      {/* 4. Overlay Station Card (Screen 3)
      {selectedStation && !isDrawerOpen && (
        <div className="absolute bottom-[90px] left-4 right-4 z-30 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <StationCard
            station={selectedStation}
            onDetail={() => setIsDrawerOpen(true)}
            onReport={() => setIsDrawerOpen(true)}
          />
        </div>
      )} */}

      {/* 5. Bottom Filter Bar / Peek Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="bg-transparent pt-8 pointer-events-auto">
          {!selectedStation && (
            <button
              onClick={() => setIsListSheetOpen(true)}
              className="w-full bg-white rounded-t-[32px] pt-3 pb-8 px-6 flex flex-col items-center shadow-[0_-4px_24px_rgba(0,0,0,0.08)] transition-colors active:bg-gray-50"
            >
              <div className="w-12 h-1.5 rounded-full bg-gray-200 mb-4" />
              <div className="w-full flex justify-start">
                <span className="text-[15px] font-bold text-gray-900">
                  ปั๊มใกล้เคียง
                </span>
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
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) setSelectedStation(null);
        }}
        onReportClick={() => setIsReportSheetOpen(true)}
      />

      <ReportUpdateSheet
        station={selectedStation}
        open={isReportSheetOpen}
        onOpenChange={setIsReportSheetOpen}
      />

      <StationListSheet
        stations={filteredStations}
        open={isListSheetOpen}
        onOpenChange={(open) => {
          setIsListSheetOpen(open);
          if (!open) setSelectedStation(null);
        }}
        selectedStation={selectedStation}
        onDetail={(station) => {
          setSelectedStation(station);
          setIsListSheetOpen(false);
          setIsDrawerOpen(true);
        }}
        onSelectStation={(station) => {
          setSelectedStation(station);
          
          // Animate map to station with padding to account for the bottom sheet
          mapRef.current?.flyTo({
            center: [station.longitude, station.latitude],
            zoom: 14.5,
            duration: 800,
            padding: { top: 0, bottom: window.innerHeight * 0.45, left: 0, right: 0 }
          });
          
          setViewport((prev) => ({
            ...prev,
            latitude: station.latitude,
            longitude: station.longitude,
            zoom: 14.5,
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
