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
} from "lucide-react";

export default function AlertSettingsPage() {
  const [step, setStep] = useState(1); // 1: Main, 2: Add Location, 3: Add Route, 4: Preferences

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Screen 1: Main Alert Settings */}
      {step === 1 && (
        <div className="animate-in fade-in duration-300">
          <header className="bg-white px-6 pt-8 pb-6 border-b border-gray-100">
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Bell className="text-blue-600" fill="currentColor" size={24} />{" "}
              แจ้งเตือนพื้นที่ของคุณ
            </h1>
          </header>

          <div className="p-4 space-y-6">
            {/* พื้นที่ของคุณ Card */}
            <section className="space-y-3">
              <div className="flex justify-between items-end px-2">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  📍 พื้นที่ของคุณ
                </h2>
                <button
                  onClick={() => setStep(2)}
                  className="text-blue-600 text-xs font-bold flex items-center gap-1"
                >
                  <Plus size={14} /> เพิ่มพื้นที่
                </button>
              </div>
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center group active:scale-95 transition">
                <div>
                  <p className="font-bold text-gray-800">เทศบาลหนองปรือ</p>
                  <p className="text-xs text-gray-400">อำเภอเมืองชลบุรี</p>
                </div>
                <ChevronRight className="text-gray-300" />
              </div>
            </section>

            {/* เส้นทางประจำ Card */}
            <section className="space-y-3">
              <div className="flex justify-between items-end px-2">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  🚗 เส้นทางประจำ
                </h2>
                <button
                  onClick={() => setStep(3)}
                  className="text-blue-600 text-xs font-bold flex items-center gap-1"
                >
                  <Plus size={14} /> เพิ่มเส้นทาง
                </button>
              </div>
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 border-dashed">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                  <MapIcon size={20} />
                </div>
                <p className="text-sm font-bold text-gray-300 italic">
                  ยังไม่มีเส้นทางที่บันทึกไว้
                </p>
              </div>
            </section>

            {/* การตั้งค่าความถี่ Card */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
                ⚙️ การตั้งค่าแจ้งเตือน
              </h2>
              <button
                onClick={() => setStep(4)}
                className="w-full bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center active:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Settings className="text-gray-400" size={18} />
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-800">
                      ความถี่: ปกติ
                    </p>
                    <p className="text-[10px] text-gray-400">
                      06:00 - 22:00 น.
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase">
                  ปรับปรุง
                </div>
              </button>
            </section>
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
