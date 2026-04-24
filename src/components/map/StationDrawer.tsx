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
  UNKNOWN: { label: "ไม่มีข้อมูล", color: "text-gray-500" },
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
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} ชั่วโมงที่แล้ว`;
}


export default function StationDrawer({
  station,
  open,
  onOpenChange,
}: StationDrawerProps) {
  const [detailedStatus, setDetailedStatus] = useState<Partial<Station> | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchedStationId, setFetchedStationId] = useState<string | null>(null);

  // Sync state during render to avoid cascading effect renders
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

    return () => {
      isMounted = false;
    };
  }, [open, station?.id]);

  if (!station) return null;

  // Use detailedStatus if available, else fallback to station prop
  const currentStatusEnum = (detailedStatus?.status ||
    station.status) as FuelStatus;
  const status = STATUS_MAP[currentStatusEnum] ?? STATUS_MAP.available;
  const queueStatus =
    detailedStatus?.queue_status || station.queue_status || "UNKNOWN";
  const queue = QUEUE_MAP[queueStatus] || QUEUE_MAP.UNKNOWN;
  const updatedAt = detailedStatus?.updated_at || station.updated_at;
  const fuels = detailedStatus?.fuels || station.fuels;

  const navUrl = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-50 outline-none max-h-[85vh]">
          {/* Drag handle */}
          <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-gray-200 my-4" />

          <div className="px-6 pb-8 overflow-y-auto">
            {/* Loading Overlay inside content */}
            {loading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-t-[32px]">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            )}

            {/* Status Hero */}
            <div className="flex items-center justify-between mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.color}`}
              >
                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                อัปเดต {timeAgo(updatedAt)}
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
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
              <MapPin size={14} className="text-blue-500" />
              <span>ห่าง {formatDistance(station.distance_meters)}</span>
              {station.address && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs line-clamp-1">
                    {station.address}
                  </span>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Fuel Availability */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">
                  เชื้อเพลิงที่มี
                </h3>
                <div className="flex flex-wrap gap-2">
                  {fuels?.length > 0 ? (
                    fuels.map((fuel: string) => (
                      <span
                        key={fuel}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-sm font-medium text-green-700"
                      >
                        ☑ {fuel}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 font-medium">
                      ไม่มีข้อมูล
                    </span>
                  )}
                </div>
              </div>

              {/* Queue Status */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">
                  คิวรอเติม
                </h3>
                <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl flex items-center justify-center">
                  <span className={`font-bold ${queue.color}`}>
                    {queue.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Data Source Info */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                แหล่งข้อมูลอัปเดต
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                    <Users size={14} />
                  </div>
                  <span>รายงานจากผู้ใช้งาน 2 ราย</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <div className="bg-green-100 p-1.5 rounded-lg text-green-600">
                    <Shield size={14} />
                  </div>
                  <span>ตรวจสอบโดยระบบอัตโนมัติ</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-4">
              <a
                href={navUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-4 rounded-2xl transition-colors shadow-sm"
              >
                <Navigation size={18} />
                นำทางไปที่นี่
              </a>
              <button className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold py-4 rounded-2xl transition-colors shadow-sm">
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
