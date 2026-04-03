"use client";

import { Drawer } from "vaul";
import { FuelStatus, StationListSheetProps } from "@/types/fuel";
import { MapPin, Navigation, Clock } from "lucide-react";

const STATUS_MAP: Record<FuelStatus, { label: string; color: string; bg: string; dot: string }> = {
  available: { label: "มีบริการ", color: "text-green-700", bg: "bg-green-100", dot: "bg-green-500" },
  partial: { label: "มีบางชนิด", color: "text-yellow-700", bg: "bg-yellow-100", dot: "bg-yellow-400" },
  limited: { label: "จำกัด", color: "text-orange-700", bg: "bg-orange-100", dot: "bg-orange-500" },
  out_of_service: { label: "ไม่มีบริการ", color: "text-red-700", bg: "bg-red-100", dot: "bg-red-500" },
};

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} ม.`;
  return `${(meters / 1000).toFixed(1)} กม.`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} ชั่วโมงที่แล้ว`;
}


export default function StationListSheet({ stations, open, onOpenChange, onSelectStation }: StationListSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-50 h-[80vh] outline-none">
          {/* Drag handle */}
          <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-gray-200 my-4" />
          
          <div className="px-6 pb-4">
            <h2 className="text-xl font-extrabold text-gray-900">
              ปั๊มในบริเวณนี้ ({stations.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              เรียงตาม: <span className="font-bold text-gray-800">ใกล้ที่สุด ▼</span>
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-4">
            {stations.map((station) => {
              const status = STATUS_MAP[station.status] ?? STATUS_MAP.available;
              const navUrl = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;

              return (
                <div 
                  key={station.id} 
                  className="bg-white border text-left border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col gap-3 active:scale-[0.98] transition-transform"
                  onClick={() => {
                    onOpenChange(false);
                    onSelectStation(station);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 leading-tight">
                        {station.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <MapPin size={12} className="text-blue-500" />
                        {formatDistance(station.distance_meters)}
                        <span className="text-gray-300">•</span>
                        <span className="text-[11px] flex items-center gap-1">
                           <Clock size={10} />
                           {timeAgo(station.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${status.bg} ${status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                    
                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Navigation size={12} />
                      นำทาง
                    </a>
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
