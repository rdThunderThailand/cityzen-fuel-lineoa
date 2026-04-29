"use client";

import { Drawer } from "vaul";
import {
  MapPin,
  Clock,
  Navigation,
  MessageSquare,
  Shield,
  Users,
  Loader2,
  ChevronLeft,
  Filter,
  Info,
  Bell
} from "lucide-react";
import { useEffect, useState } from "react";
import type { FuelStatus, Station, StationDrawerProps } from "@/types/fuel";

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

const QUEUE_MAP: Record<string, { label: string; color: string }> = {
  CLEAR: { label: "น้อย", color: "text-green-600" },
  MODERATE: { label: "ปานกลาง", color: "text-yellow-600" },
  HEAVY: { label: "หนาแน่น", color: "text-orange-600" },
  GRIDLOCK: { label: "ติดขัด", color: "text-red-600" },
  UNKNOWN: { label: "-", color: "text-gray-500" },
};

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} ม.`;
  return `${(meters / 1000).toFixed(1)} กม.`;
}

function timeAgo(dateStr: string) {
  if (!dateStr) return "-";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาที`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} ชั่วโมง`;
}

const getStationImage = (brand: string) => {
  const b = (brand || "").toLowerCase();
  if (b.includes("ปตท") || b.includes("ptt")) return "https://images.unsplash.com/photo-1563212036-7c3e5eb564e6?auto=format&fit=crop&q=80&w=600";
  if (b.includes("บางจาก") || b.includes("bangchak")) return "https://images.unsplash.com/photo-1542345307-d86161a0b38c?auto=format&fit=crop&q=80&w=600";
  return "https://images.unsplash.com/photo-1503698064437-059dcab39690?auto=format&fit=crop&q=80&w=600";
};

export default function StationDrawer({
  station,
  open,
  onOpenChange,
  onReportClick,
}: StationDrawerProps) {
  const [detailedStatus, setDetailedStatus] = useState<Partial<Station> | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchedStationId, setFetchedStationId] = useState<string | null>(null);

  if (open && station?.id && fetchedStationId !== station.id) {
    setLoading(true);
    setDetailedStatus(null);
    setFetchedStationId(station.id);
  } else if (!open && fetchedStationId !== null) {
    setLoading(false);
    setDetailedStatus(null);
    setFetchedStationId(null);
  }

  useEffect(() => {
    if (!open || !station?.id) return;
    let isMounted = true;
    fetch(`/api/fuel/stations/${station.id}/status`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setDetailedStatus(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch detailed status", err);
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [open, station?.id]);

  if (!station) return null;

  const currentStatusEnum = (detailedStatus?.status || station.status) as FuelStatus;
  const status = STATUS_MAP[currentStatusEnum] ?? STATUS_MAP.available;
  const queueStatus = detailedStatus?.queue_status || station.queue_status || "UNKNOWN";
  const queue = QUEUE_MAP[queueStatus] || QUEUE_MAP.UNKNOWN;
  const updatedAt = detailedStatus?.updated_at || station.updated_at;
  const fuels = detailedStatus?.fuels || station.fuels || ["ดีเซล", "เบนซิน", "แก๊สโซฮอล์", "EV"]; // Placeholder fallback for design match

  const navUrl = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const staticMapUrl = token ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-s+2563eb(${station.longitude},${station.latitude})/${station.longitude},${station.latitude},15,0/600x300@2x?access_token=${token}` : null;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-white z-50" />
        <Drawer.Content className="bg-gray-50 flex flex-col fixed inset-0 z-50 outline-none h-[100dvh]">
          {/* Header */}
          <div className="flex items-center p-4 bg-white sticky top-0 z-10 border-b border-gray-100 shrink-0">
            <button onClick={() => onOpenChange(false)} className="p-2 -ml-2 active:opacity-70 transition-opacity">
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <Drawer.Title className="flex-1 text-center text-[17px] font-medium text-gray-800 pr-8">
              {station.name}
            </Drawer.Title>
          </div>

          <div className="flex-1 overflow-y-auto pb-32">
            {loading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            )}

            {/* Image */}
            <div className="bg-white px-4 pt-4 pb-3">
              <img 
                src={getStationImage(station.brand)} 
                alt={station.name}
                className="w-full h-48 object-cover rounded-2xl border border-gray-100"
              />
            </div>

            {/* Status */}
            <div className="bg-white px-4 pb-4 mb-2 flex justify-between items-center shadow-sm">
              <span className={`text-xl font-bold ${status.color}`}>
                {status.label}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <Clock size={12} />
                อัปเดต {timeAgo(updatedAt)}
              </span>
            </div>

            {/* Fuels Info */}
            <div className="bg-white mx-4 rounded-2xl border border-gray-100 overflow-hidden mb-4 shadow-sm">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
                <Filter size={16} className="text-[#34445c]" />
                <h3 className="text-[13px] font-bold text-gray-800">เชื้อเพลิงที่มีให้บริการ</h3>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {fuels?.length > 0 ? fuels.map((f: string) => (
                  <span key={f} className="px-3 py-1 bg-white border border-[#4CAF50] text-[#4CAF50] rounded-md text-[11px] font-medium">
                    {f}
                  </span>
                )) : (
                  <span className="text-sm text-gray-400">ไม่มีข้อมูล</span>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white mx-4 rounded-2xl border border-gray-100 overflow-hidden mb-4 shadow-sm">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
                <Info size={16} className="text-[#34445c]" />
                <h3 className="text-[13px] font-bold text-gray-800">ข้อมูลเพิ่มเติม</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-gray-600">ปริมาณคิว</span>
                  <span className={`text-[13px] ${queue.color}`}>{queue.label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-gray-600">แหล่งข้อมูล</span>
                  <span className="text-[13px] text-[#4ea8ff]">ตรวจสอบโดยพื้นที่</span>
                </div>
              </div>
            </div>

            {/* Map Preview */}
            <div className="mx-4 bg-gray-200 rounded-2xl h-48 flex flex-col items-center justify-center text-gray-400 mb-8 border border-gray-100 overflow-hidden relative">
              {staticMapUrl ? (
                <img src={staticMapUrl} alt="Map Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="bg-white p-2 rounded-full mb-2 shadow-sm">
                    <MapPin size={24} className="text-gray-400" />
                  </div>
                  <span className="text-[11px] font-medium">แผนที่จะแสดงที่นี่</span>
                </>
              )}
            </div>
          </div>

          {/* Fixed Footer Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8 space-y-3 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
            <a 
              href={navUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#34445c] hover:bg-[#2a3648] text-white py-3.5 rounded-xl font-bold text-sm transition-colors"
            >
              <Navigation size={16} /> นำทาง
            </a>
            <button 
              onClick={onReportClick}
              className="flex items-center justify-center gap-2 w-full bg-[#eef5fd] hover:bg-[#e0effc] text-[#1c8ffb] py-3.5 rounded-xl font-bold text-sm transition-colors border border-[#d6eaff]"
            >
              <Bell size={16} /> แจ้งอัปเดต
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
