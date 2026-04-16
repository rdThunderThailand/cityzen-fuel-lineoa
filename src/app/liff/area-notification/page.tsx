// src/app/liff/alerts/page.tsx
"use client";
import { useState } from "react";
import {
  Bell,
  MapPin,
  Map as MapIcon,
  Settings,
  Plus,
  ChevronRight,
  X,
  Search,
  ChevronLeft,
  Car,
} from "lucide-react";

export default function AlertSettingsPage() {
  const [step, setStep] = useState(1); // 1: Main, 2: Add Location, 3: Add Route, 4: Preferences

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Screen 1: Main Alert Settings */}
      {step === 1 && (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
          {/* --- Header --- */}
          <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-10">
            <button className="p-2 -ml-2 text-gray-400">
              <ChevronLeft size={24} />
            </button>
            <h1 className="flex-1 text-center text-lg font-bold text-gray-800 mr-8">
              แจ้งเตือนพื้นที่
            </h1>
          </header>

          {/* --- Body Content --- */}
          <div className="p-4 space-y-4">
            {/* Card 1: การตั้งค่าแจ้งเตือน */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-slate-100 p-1.5 rounded-lg text-slate-700">
                    <Bell size={18} fill="currentColor" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    การตั้งค่าแจ้งเตือน
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">
                      ความถี่: อัปเดตบ่อย
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      เวลา: 06:00 - 22:00
                    </p>
                  </div>
                  <button className="bg-[#304052] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-transform">
                    ปรับการตั้งค่า
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: พื้นที่ของคุณ */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-slate-100 p-1.5 rounded-lg text-slate-700">
                    <MapPin size={18} fill="currentColor" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    พื้นที่ของคุณ
                  </span>
                </div>

                <button className="w-full py-4 border-2 border-dashed border-blue-200 rounded-2xl flex items-center justify-center gap-2 text-blue-500 font-bold text-sm bg-blue-50/30 hover:bg-blue-50 transition-colors active:scale-[0.98]">
                  <Plus size={18} strokeWidth={3} />
                  เพิ่มพื้นที่
                </button>
              </div>
            </div>

            {/* Card 3: เส้นทางประจำ */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-slate-100 p-1.5 rounded-lg text-slate-700">
                    <Car size={18} fill="currentColor" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    เส้นทางประจำ
                  </span>
                </div>

                <button className="w-full py-4 border-2 border-dashed border-blue-200 rounded-2xl flex items-center justify-center gap-2 text-blue-500 font-bold text-sm bg-blue-50/30 hover:bg-blue-50 transition-colors active:scale-[0.98]">
                  <Plus size={18} strokeWidth={3} />
                  เพิ่มเส้นทางประจำ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 2: Add Location (Simplified) */}
      {step === 2 && (
        <div className="animate-in slide-in-from-right duration-300 bg-white min-h-screen">
          <header className="px-4 pt-6 pb-4 flex items-center justify-between border-b border-gray-50">
            <button onClick={() => setStep(1)} className="p-2 text-gray-400">
              <X />
            </button>
            <h1 className="font-bold text-lg">เพิ่มพื้นที่</h1>
            <div className="w-10" />
          </header>

          <div className="p-6 space-y-6">
            <div className="bg-gray-100 rounded-2xl flex items-center px-4">
              <Search className="text-gray-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหา อำเภอ / เทศบาล"
                className="w-full p-4 bg-transparent outline-none text-sm"
              />
            </div>

            <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 space-y-4">
              <p className="font-black text-blue-900 text-lg">
                📍 อำเภอเมืองชลบุรี
              </p>
              <div className="space-y-3">
                {["น้ำมัน", "น้ำ / ไฟ", "เหตุฉุกเฉิน", "ข่าวสำคัญ"].map(
                  (type) => (
                    <label
                      key={type}
                      className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-blue-50"
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 rounded-lg border-blue-200 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-bold text-gray-700">
                        {type}
                      </span>
                    </label>
                  ),
                )}
              </div>
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100"
            >
              บันทึกพื้นที่
            </button>
          </div>
        </div>
      )}

      {/* ... Screen อื่นๆ ... */}
    </main>
  );
}
