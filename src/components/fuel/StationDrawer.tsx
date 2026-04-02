"use client";

import { Drawer } from "vaul";
import { MapPin, Clock, Navigation, MessageSquare, Shield, Users } from "lucide-react";
import type { Station, FuelStatus } from "@/types/fuel";

const STATUS_MAP: Record<FuelStatus, { label: string; color: string; bg: string; dot: string }> = {
  available:      { label: "มีบริการ",     color: "text-green-700",  bg: "bg-green-100",  dot: "bg-green-500" },
  partial:        { label: "มีบางชนิด",   color: "text-yellow-700", bg: "bg-yellow-100", dot: "bg-yellow-400" },
  limited:        { label: "จำกัด",       color: "text-orange-700", bg: "bg-orange-100", dot: "bg-orange-500" },
  out_of_service: { label: "ไม่มีบริการ", color: "text-red-700",    bg: "bg-red-100",    dot: "bg-red-500" },
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

interface StationDrawerProps {
  station: Station | null;
  mode: "detail" | "report";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StationDrawer({ station, mode: _mode, open, onOpenChange }: StationDrawerProps) {
  if (!station) return null;

  const status = STATUS_MAP[station.status] ?? STATUS_MAP.available;
  const navUrl = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-50 outline-none max-h-[85vh]">
          {/* Drag handle */}
          <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-gray-200 my-4" />

          <div className="px-6 pb-8 overflow-y-auto">
            {/* Status Hero */}
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                อัปเดต {timeAgo(station.updated_at)}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
              {station.name}
            </h2>
            {station.brand && (
              <p className="text-sm text-gray-400 mb-4">{station.brand}</p>
            )}

            {/* Distance & Address */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <MapPin size={14} className="text-blue-500" />
              <span>ห่าง {formatDistance(station.distance_meters)}</span>
              {station.address && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs">{station.address}</span>
                </>
              )}
            </div>

            {/* Fuel Availability */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">
                เชื้อเพลิงที่มี
              </h3>
              <div className="flex flex-wrap gap-2">
                {station.fuels.length > 0 ? (
                  station.fuels.map((fuel) => (
                    <span
                      key={fuel}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-sm font-medium text-green-700"
                    >
                      ☑ {fuel}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">ไม่มีข้อมูล</span>
                )}
              </div>
            </div>

            {/* Source Info */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                แหล่งข้อมูล
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={14} className="text-blue-500" />
                  <span>รายงานจากภาคประชาชน</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={14} className="text-green-500" />
                  <span>ตรวจสอบโดยทีมพื้นที่</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <a
                href={navUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-4 rounded-2xl transition-colors"
              >
                <Navigation size={18} />
                นำทางไปที่นี่
              </a>
              <button className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-4 rounded-2xl transition-colors">
                <MessageSquare size={18} />
                แจ้งอัปเดตสถานะ
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
