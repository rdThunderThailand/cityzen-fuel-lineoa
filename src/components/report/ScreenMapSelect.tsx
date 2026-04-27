"use client";
import { useState, useMemo } from "react";
import Map, { Marker, GeolocateControl, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { ChevronLeft, Search, Filter, CheckCircle2, MapPin } from "lucide-react";
import { Station } from "@/types/fuel";

const STATUS_MAP: Record<string, { label: string; bg: string; dot: string; color: string }> = {
  available: { label: "มีบริการ", bg: "bg-[#e0f8e9]", dot: "bg-[#1ca34d]", color: "text-[#1ca34d]" },
  partial: { label: "มีบางชนิด", bg: "bg-yellow-100", dot: "bg-yellow-400", color: "text-yellow-700" },
  limited: { label: "จำกัด", bg: "bg-orange-100", dot: "bg-orange-500", color: "text-orange-700" },
  out_of_service: { label: "ไม่มีบริการ", bg: "bg-red-100", dot: "bg-red-500", color: "text-red-700" },
};

export function ScreenMapSelect({ 
  initialStations, 
  initialLocation,
  onBack, 
  onConfirm 
}: { 
  initialStations: Station[];
  initialLocation: { lat: number, lng: number } | null;
  onBack: () => void;
  onConfirm: (station: Station) => void;
}) {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [filter, setFilter] = useState("ทั้งหมด");
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const [viewport, setViewport] = useState({
    latitude: initialLocation?.lat || 13.7367,
    longitude: initialLocation?.lng || 100.5231,
    zoom: 13,
  });

  const filteredStations = useMemo(() => {
    if (filter === "ทั้งหมด") return stations;
    return stations.filter(s => s.fuels.includes(filter));
  }, [stations, filter]);

  return (
    <div className="fixed inset-0 z-50 bg-[#f4f4f4] flex flex-col animate-in fade-in slide-in-from-right">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-3 border-b border-gray-100 z-10 flex flex-col gap-3 shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-500">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-[17px] font-medium text-gray-800">ค้นหาปั๊มอื่น / เลือกบนแผนที่</h1>
          <div className="w-10" />
        </div>
        
        {/* Search Box */}
        <div className="relative border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="ค้นหาปั๊มน้ำมัน" 
            className="w-full pl-10 pr-10 py-3 text-sm focus:outline-none bg-transparent"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center border-l border-gray-100 pl-3">
            <Filter size={18} className="text-gray-400" />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {["ทั้งหมด", "ดีเซล", "เบนซิน", "แก๊สโซฮอล์"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${filter === f ? 'bg-[#34445c] text-white border-[#34445c]' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 relative bg-gray-100">
        {mapboxAccessToken && (
          <Map
            initialViewState={viewport}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken={mapboxAccessToken}
            style={{ width: "100%", height: "100%" }}
            onMove={(evt) => setViewport(evt.viewState)}
            onClick={() => setSelectedStation(null)}
          >
            {filteredStations.map((s) => {
              const isSelected = selectedStation?.id === s.id;
              
              return (
                <Marker
                  key={s.id}
                  latitude={s.latitude}
                  longitude={s.longitude}
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedStation(s);
                  }}
                  style={{ zIndex: isSelected ? 10 : 1 }}
                >
                  {isSelected ? (
                    <div className="relative flex items-center justify-center -translate-y-1/2">
                      <div className="absolute w-12 h-12 bg-blue-500/20 rounded-full animate-ping" />
                      <div className="w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white shadow-md relative z-10" />
                    </div>
                  ) : (
                    <div className="relative flex flex-col items-center -translate-y-1/2 cursor-pointer">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white ${s.status === 'out_of_service' ? 'bg-red-500' : 'bg-[#1ca34d]'}`}>
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      </div>
                    </div>
                  )}
                </Marker>
              );
            })}

            <div className="absolute top-4 right-4 flex flex-col gap-2">
               <GeolocateControl position="top-right" showAccuracyCircle={false} />
               <NavigationControl position="top-right" showCompass={false} />
            </div>

            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <button className="bg-black text-white px-4 py-2 rounded-full text-[11px] font-medium flex items-center gap-1.5 shadow-lg opacity-90 border border-gray-700">
                 <Search size={12} /> ค้นหาบริเวณนี้
              </button>
            </div>
          </Map>
        )}
      </div>

      {/* Bottom Card */}
      {selectedStation && (
        <div className="absolute bottom-6 left-4 right-4 z-20 animate-in slide-in-from-bottom-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                <img 
                  src={selectedStation.brand === "PTT" ? "https://cityzen-fuel-lineoa.vercel.app/ptt-station.jpg" : "https://mpics.mgronline.com/pics/Images/566000002821101.JPEG"} 
                  alt={selectedStation.brand} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-900 truncate text-sm leading-tight pr-2">{selectedStation.name}</p>
                  {/* Status badge */}
                  <div className="flex items-center gap-1 bg-[#e0f8e9] px-2 py-0.5 rounded-full shrink-0">
                    <CheckCircle2 size={10} className="text-[#1ca34d] fill-current bg-white rounded-full" />
                    <span className="text-[10px] font-bold text-[#1ca34d]">มีบริการ</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <MapPin size={12} />
                  <span className="truncate">ห่าง {(selectedStation.distance_meters / 1000).toFixed(1)} กม.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onConfirm(selectedStation)}
              className="mt-4 w-full py-3 rounded-xl text-white font-medium text-sm bg-[#34445c] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm"
            >
              <CheckCircle2 size={16} /> ดำเนินการต่อ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
