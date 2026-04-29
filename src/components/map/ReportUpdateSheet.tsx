"use client";

import { Drawer } from "vaul";
import { X, Save } from "lucide-react";
import { useState, useEffect } from "react";
import type { FuelStatus, ReportUpdateSheetProps } from "@/types/fuel";

const FUEL_TYPES = ["ดีเซล", "เบนซิน", "แก๊สโซฮอล์", "EV"];

const STATUS_OPTIONS: { id: FuelStatus; label: string; dot: string }[] = [
  { id: "available", label: "มีบริการ", dot: "bg-green-500" },
  { id: "partial", label: "มีบางชนิด", dot: "bg-yellow-400" },
  { id: "limited", label: "จำกัด / คิวยาว", dot: "bg-orange-500" },
  { id: "out_of_service", label: "ไม่มีบริการ", dot: "bg-red-500" },
];

export default function ReportUpdateSheet({
  station,
  open,
  onOpenChange,
}: ReportUpdateSheetProps) {
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<FuelStatus>("available");

  // Reset state when opening for a new station
  useEffect(() => {
    if (open && station) {
      setSelectedFuels(station.fuels || []);
      setSelectedStatus(station.status || "available");
    }
  }, [open, station]);

  const toggleFuel = (fuel: string) => {
    setSelectedFuels((prev) =>
      prev.includes(fuel) ? prev.filter((f) => f !== fuel) : [...prev, fuel]
    );
  };

  const handleSave = () => {
    // Implement save logic here
    // e.g. call API to update status
    console.log("Saving report for station:", station?.id, { selectedFuels, selectedStatus });
    onOpenChange(false);
  };

  if (!station) return null;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[60] outline-none max-h-[90dvh]">
          {/* Drag handle */}
          <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-gray-200 my-4" />

          <div className="px-6 flex justify-between items-center mb-6">
            <Drawer.Title className="text-lg font-bold text-gray-900">
              ตั้งแจ้งสถานการณ์ของปั๊มนี้
            </Drawer.Title>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6">
            {/* Fuel Types Section */}
            <div>
              <h3 className="text-[15px] font-bold text-gray-800 mb-3">
                ประเภทเชื้อเพลิง
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {FUEL_TYPES.map((fuel) => (
                  <label
                    key={fuel}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFuels.includes(fuel)}
                      onChange={() => toggleFuel(fuel)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                    />
                    <span className="text-[13px] text-gray-700 font-medium">
                      {fuel}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Section */}
            <div>
              <h3 className="text-[15px] font-bold text-gray-800 mb-3">
                สถานะปั๊ม
              </h3>
              <div className="space-y-3">
                {STATUS_OPTIONS.map((status) => (
                  <label
                    key={status.id}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors w-full"
                  >
                    <input
                      type="radio"
                      name="stationStatus"
                      checked={selectedStatus === status.id}
                      onChange={() => setSelectedStatus(status.id)}
                      className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                    />
                    <div className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
                    <span className="text-[14px] text-gray-700 font-medium">
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 w-full bg-[#34445c] hover:bg-[#2a3648] text-white py-3.5 rounded-xl font-bold text-[15px] transition-colors"
            >
              <Save size={18} /> บันทึก
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
