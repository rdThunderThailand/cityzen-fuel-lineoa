"use client";

import { Navigation, MapPin, Clock, FileText, MessageSquare } from "lucide-react";
import type { FuelStatus, StationCardProps } from "@/types/fuel";

/* ── Status helpers ─────────────────────────────── */
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


/* ── Component ──────────────────────────────────── */
export default function StationCard({ station, onDetail, onReport }: StationCardProps) {
  const status = STATUS_MAP[station.status] ?? STATUS_MAP.available;
  const navUrl = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* ── Top row: status badge + updated time ── */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          {status.label}
        </span>
        <span className="text-[11px] text-gray-400 flex items-center gap-1">
          <Clock size={12} />
          {timeAgo(station.updated_at)}
        </span>
      </div>

      {/* ── Station name ── */}
      <div className="px-5 pb-1">
        <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
          {station.name}
        </h3>
        {station.brand && (
          <p className="text-xs text-gray-400 mt-0.5">{station.brand}</p>
        )}
      </div>

      {/* ── Info chips ── */}
      <div className="px-5 pb-2 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} className="text-blue-500" />
          {formatDistance(station.distance_meters)}
        </span>

        {station.fuels?.length > 0 && (
          <span className="text-xs text-gray-300">•</span>
        )}

        {(station.fuels || []).map((fuel) => (
          <span
            key={fuel}
            className="px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-600 font-medium"
          >
            {fuel}
          </span>
        ))}
      </div>

      {/* ── Action buttons ── */}
      <div className="px-4 pb-4 pt-2 flex flex-col gap-2">
        <div className="flex gap-2">
          {onDetail && (
            <button
              onClick={onDetail}
              className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold px-4 py-3 rounded-2xl transition-colors"
            >
              <FileText size={16} />
              ดูรายละเอียด
            </button>
          )}
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-3 rounded-2xl transition-colors"
          >
            <Navigation size={16} />
            นำทาง
          </a>
        </div>
        
        {onReport && (
          <button
            onClick={onReport}
            className="w-full flex items-center justify-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-bold py-2.5 rounded-2xl transition-colors"
          >
            <MessageSquare size={16} />
            แจ้งอัปเดต
          </button>
        )}
      </div>
    </div>
  );
}
