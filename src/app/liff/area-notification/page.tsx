"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, Bell, MapPin, Car, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

// สร้าง Interface สำหรับข้อมูลพื้นที่
interface SavedLocation {
  id: string;
  province: string;
  district: string;
  alertType?: string;
}

export default function AlertMainPage() {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. ดึงข้อมูลจาก LocalStorage (ที่เซฟมาจากหน้า Add Location)
  useEffect(() => {
    const loadLocations = () => {
      const data = localStorage.getItem("cityzen_saved_locations");
      if (data) {
        setSavedLocations(JSON.parse(data));
      }
      setLoading(false);
    };

    loadLocations();
    // ฟังการเปลี่ยนแปลงของ Storage (เผื่อมีการอัปเดตจากหน้าอื่น)
    window.addEventListener("storage", loadLocations);
    return () => window.removeEventListener("storage", loadLocations);
  }, []);

  // 2. ฟังก์ชันลบพื้นที่
  const handleDelete = (id: string) => {
    const updated = savedLocations.filter((loc) => loc.id !== id);
    setSavedLocations(updated);
    localStorage.setItem("cityzen_saved_locations", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* --- Header --- */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-10">
        <Link href="/liff" className="p-2 -ml-2 text-gray-400">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800 mr-8">
          แจ้งเตือนพื้นที่
        </h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Card 1: การตั้งค่าแจ้งเตือน */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
            <Bell size={16} className="text-[#304052]" fill="currentColor" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              การตั้งค่าแจ้งเตือน
            </span>
          </div>
          <div className="p-5 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-gray-800">
                ความถี่: อัปเดตบ่อย
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                เวลา: 06:00 - 22:00
              </p>
            </div>
            <button className="bg-[#304052] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition">
              ปรับการตั้งค่า
            </button>
          </div>
        </div>

        {/* Section: พื้นที่ของคุณ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <MapPin size={16} className="text-[#304052]" fill="currentColor" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              พื้นที่ของคุณ
            </span>
          </div>

          {/* ปุ่มเพิ่มพื้นที่ (Dashed Box) */}
          <Link
            href="/liff/area-notification/add-location"
            className="block px-1"
          >
            <div className="w-full py-4 border-2 border-dashed border-blue-200 rounded-2xl flex items-center justify-center gap-2 text-blue-500 font-bold text-sm bg-blue-50/30">
              <Plus size={18} strokeWidth={3} />
              เพิ่มพื้นที่
            </div>
          </Link>

          {/* แสดงรายการพื้นที่จริงที่เลือกมา */}
          {savedLocations.length > 0
            ? savedLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="mx-1 p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center justify-between animate-in slide-in-from-right-4 duration-300"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      {loc.province} &gt; {loc.district}
                    </span>
                    <span className="text-xs text-gray-400 mt-1 font-medium">
                      แจ้งเตือน: {loc.alertType || "เหตุฉุกเฉิน"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="p-3 bg-[#EBF5FF] text-[#3B82F6] rounded-xl active:scale-90 transition-transform"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            : !loading && (
                <div className="text-center py-4 text-gray-300 text-xs italic">
                  ยังไม่มีพื้นที่ที่ติดตาม
                </div>
              )}
        </div>

        {/* Section: เส้นทางประจำ */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 px-2">
            <Car size={16} className="text-[#304052]" fill="currentColor" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              เส้นทางประจำ
            </span>
          </div>

          <div className="mx-1 py-4 border-2 border-dashed border-blue-200 rounded-2xl flex items-center justify-center gap-2 text-blue-500 font-bold text-sm bg-blue-50/30">
            <Plus size={18} strokeWidth={3} />
            เพิ่มเส้นทางประจำ
          </div>
        </div>
      </div>
    </div>
  );
}
