"use client";

import { Drawer } from "vaul";
import { FuelStatus, StationListSheetProps } from "@/types/fuel";
import { MapPin, Navigation, Clock, CheckCircle2, AlertCircle, XCircle, Filter } from "lucide-react";

const STATUS_MAP: Record<FuelStatus, { label: string; color: string; bg: string; dot: string }> = {
  available: { label: "มีบริการ", color: "text-green-700", bg: "bg-green-100", dot: "bg-green-500" },
  partial: { label: "มีบางชนิด", color: "text-yellow-700", bg: "bg-yellow-100", dot: "bg-yellow-400" },
  limited: { label: "จำกัด", color: "text-orange-700", bg: "bg-orange-100", dot: "bg-orange-500" },
  out_of_service: { label: "ไม่มีบริการ", color: "text-red-700", bg: "bg-red-100", dot: "bg-red-500" },
};

const getStatusIcon = (status: FuelStatus) => {
  if (status === "available") return <CheckCircle2 size={10} />;
  if (status === "partial" || status === "limited") return <AlertCircle size={10} />;
  return <XCircle size={10} />;
};

function formatDistance(meters: number) {
  if (meters < 1000) return `ห่าง ${Math.round(meters)} ม.`;
  return `ห่าง ${(meters / 1000).toFixed(1)} กม.`;
}

function timeAgo(dateStr: string) {
  if (!dateStr) return "อัปเดตล่าสุด";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "อัปเดตเมื่อสักครู่";
  if (mins < 60) return `อัปเดต ${mins} นาที`;
  const hrs = Math.floor(mins / 60);
  return `อัปเดต ${hrs} ชั่วโมง`;
}

// Temporary placeholder images based on brand
const getStationImage = (brand: string) => {
  const b = (brand || "").toLowerCase();
  if (b.includes("ปตท") || b.includes("ptt")) return "https://images.unsplash.com/photo-1563212036-7c3e5eb564e6?auto=format&fit=crop&q=80&w=200";
  if (b.includes("บางจาก") || b.includes("bangchak")) return "https://images.unsplash.com/photo-1542345307-d86161a0b38c?auto=format&fit=crop&q=80&w=200";
  return "https://images.unsplash.com/photo-1503698064437-059dcab39690?auto=format&fit=crop&q=80&w=200";
};

export default function StationListSheet({ stations, open, onOpenChange, onSelectStation, selectedStation, onDetail }: StationListSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-50 h-[40vh] outline-none">
          {/* Drag handle */}
          <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-gray-200 my-4" />
          
          <div className="px-6 pb-4 flex justify-between items-center border-b border-gray-100">
            <Drawer.Title className="text-[15px] font-bold text-gray-900">
              ปั๊มใกล้เคียง
            </Drawer.Title>
            <button className="flex items-center gap-1.5 bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full text-[11px] font-medium active:scale-95 transition-transform">
              <Filter size={12} />
              ใกล้ที่สุด
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-8 pt-4">
            {stations.map((station, index) => {
              const status = STATUS_MAP[station.status] ?? STATUS_MAP.available;
              const navUrl = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;
              const isSelected = selectedStation?.id === station.id;

              return (
                <div 
                  key={station.id} 
                  className={`flex gap-3 px-6 py-4 cursor-pointer transition-colors ${isSelected ? 'bg-[#eef5fd]' : ''} ${index !== stations.length - 1 && !isSelected ? 'border-b border-gray-100 mx-6 px-0' : ''}`}
                  onClick={() => {
                    onSelectStation(station);
                  }}
                >
                  <img 
                    src={getStationImage(station.brand)} 
                    alt={station.name}
                    className="w-[72px] h-[72px] rounded-xl object-cover shrink-0 border border-gray-100"
                  />
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-1 pr-2">
                        {station.name}
                      </h3>
                      <span className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${status.bg} ${status.color}`}>
                        {getStatusIcon(station.status)}
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                      <MapPin size={12} />
                      {formatDistance(station.distance_meters)}
                    </div>
                    
                    <div className="flex justify-between items-end mt-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Clock size={12} />
                        {timeAgo(station.updated_at)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isSelected && onDetail && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDetail(station);
                            }}
                            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                          >
                            รายละเอียด
                          </button>
                        )}
                        <a
                          href={navUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-[#34445c] hover:bg-[#2a3648] text-white text-[11px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Navigation size={12} />
                          นำทาง
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {stations.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p>ไม่พบปั๊มในบริเวณนี้</p>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
