"use client";

import { Drawer } from "vaul";
import { useState } from "react";

import { FilterState, FilterSheetProps } from "@/types/fuel";

const FUEL_OPTIONS = ["ดีเซล", "เบนซิน", "แก๊สโซฮอล์", "EV"];
const STATUS_OPTIONS = [
  { id: "available", label: "มีบริการ" },
  { id: "partial", label: "มีบางชนิด" },
  { id: "limited", label: "จำกัด" },
  { id: "out_of_service", label: "ไม่มีบริการ" },
];
const DISTANCE_OPTIONS = [5, 10, 20];

export default function FilterSheet({ open, onOpenChange, filters, onApply }: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Sync when opened
  if (open && localFilters !== filters) {
    setLocalFilters(filters);
  }

  const toggleFuel = (fuel: string) => {
    setLocalFilters(prev => ({
      ...prev,
      fuels: prev.fuels.includes(fuel)
        ? prev.fuels.filter(f => f !== fuel)
        : [...prev.fuels, fuel]
    }));
  };

  const toggleStatus = (statusId: string) => {
    setLocalFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(statusId)
        ? prev.statuses.filter(s => s !== statusId)
        : [...prev.statuses, statusId]
    }));
  };

  const setDistance = (distance: number) => {
    setLocalFilters(prev => ({ ...prev, distance }));
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-50 outline-none">
          {/* Drag handle */}
          <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-gray-200 my-4" />
          
          <div className="px-6 pb-2">
            <h2 className="text-xl font-extrabold text-gray-900">ตัวกรอง</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
            {/* เชื้อเพลิง */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3">เชื้อเพลิง:</h3>
              <div className="grid grid-cols-2 gap-2">
                {FUEL_OPTIONS.map((f) => (
                  <label key={f} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={localFilters.fuels.includes(f)}
                      onChange={() => toggleFuel(f)}
                    />
                    <span className="text-sm text-gray-700">{f}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* สถานะ */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3">สถานะ:</h3>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={localFilters.statuses.includes(s.id)}
                      onChange={() => toggleStatus(s.id)}
                    />
                    <span className="text-sm text-gray-700">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ระยะทาง */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3">ระยะทาง:</h3>
              <div className="flex gap-4">
                {DISTANCE_OPTIONS.map((d) => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="distance"
                      className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={localFilters.distance === d}
                      onChange={() => setDistance(d)}
                    />
                    <span className="text-sm text-gray-700">{d} กม.</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 pb-8 pt-2 border-t border-gray-100">
            <button 
              onClick={() => {
                onApply(localFilters);
                onOpenChange(false);
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-4 rounded-2xl transition-colors"
            >
              ใช้ตัวกรอง
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
