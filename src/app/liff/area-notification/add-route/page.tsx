"use client";
import React, { useState } from "react";
import {
  ChevronLeft,
  MapPin,
  Bell,
  TriangleAlert,
  Store,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import liff from "@line/liff";
import { reportDb } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AddRoutePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // State สำหรับสถานที่
  const [origin, setOrigin] = useState({ label: "", address: "" });
  const [dest, setDest] = useState({ label: "", address: "" });

  const [alerts, setAlerts] = useState({
    fuel: false,
    traffic: false,
    restStop: false,
  });

  const toggleAlert = (key: keyof typeof alerts) => {
    setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!origin.address || !dest.address) {
      alert("กรุณาระบุสถานที่ต้นทางและปลายทางครับ");
      return;
    }

    setSaving(true);
    try {
      const profile = await liff.getProfile();
      const selectedOptions = Object.keys(alerts).filter(
        (key) => alerts[key as keyof typeof alerts],
      );

      const { error } = await reportDb.from("user_routes").insert({
        user_id: profile.userId,
        origin: origin.address, // เก็บที่อยู่จริง
        origin_label: origin.label || origin.address, // เก็บชื่อเรียก (ถ้าไม่ตั้ง เอาที่อยู่มาเป็นชื่อ)
        destination: dest.address,
        destination_label: dest.label || dest.address,
        alert_options: selectedOptions,
      });

      if (error) throw error;
      router.push("/liff/area-notification");
    } catch (err: any) {
      alert("บันทึกไม่สำเร็จ: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-10 text-[#304052]">
        <Link
          href="/liff/area-notification"
          className="p-2 -ml-2 text-gray-400"
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className="flex-1 text-center text-lg font-bold">
          เพิ่มเส้นทางประจำ
        </h1>
      </header>

      <div className="p-4 space-y-4">
        {/* --- ส่วนพิกัด: ต้นทาง --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-bold text-gray-400 uppercase">
              จุดเริ่มต้น
            </span>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="ตั้งชื่อสถานที่ (เช่น บ้าน)"
              className="w-full bg-blue-50/50 border-none rounded-xl px-4 py-3 text-sm font-bold text-blue-600 placeholder:text-blue-300 outline-none"
              value={origin.label}
              onChange={(e) => setOrigin({ ...origin, label: e.target.value })}
            />
            <div className="relative">
              <Search
                className="absolute left-3 top-3.5 text-gray-300"
                size={16}
              />
              <input
                type="text"
                placeholder="ค้นหาที่อยู่ในแผนที่..."
                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none"
                value={origin.address}
                onChange={(e) =>
                  setOrigin({ ...origin, address: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* --- ส่วนพิกัด: ปลายทาง --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-bold text-gray-400 uppercase">
              จุดหมายปลายทาง
            </span>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="ตั้งชื่อสถานที่ (เช่น ปั๊มแถวบ้าน)"
              className="w-full bg-red-50/50 border-none rounded-xl px-4 py-3 text-sm font-bold text-red-600 placeholder:text-red-300 outline-none"
              value={dest.label}
              onChange={(e) => setDest({ ...dest, label: e.target.value })}
            />
            <div className="relative">
              <Search
                className="absolute left-3 top-3.5 text-gray-300"
                size={16}
              />
              <input
                type="text"
                placeholder="ค้นหาที่อยู่ในแผนที่..."
                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none"
                value={dest.address}
                onChange={(e) => setDest({ ...dest, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* --- Section 2: เลือกการแจ้งเตือน --- */}
        <div className="bg-white rounded-4xl shadow-sm border border-gray-50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
            <Bell size={16} className="text-[#304052]" fill="currentColor" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              เลือกการแจ้งเตือนบนเส้นทาง
            </span>
          </div>

          <div className="p-4 space-y-3">
            {/* Option 1 */}
            <div
              onClick={() => toggleAlert("fuel")}
              className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl bg-white shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-[#304052]" />
                <span className="text-sm font-medium text-gray-700">
                  ราคาน้ำมันตามเส้นทาง
                </span>
              </div>
              <div
                className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${alerts.fuel ? "bg-blue-500 border-blue-500" : "border-gray-200"}`}
              >
                {alerts.fuel && (
                  <div className="w-2 h-1 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />
                )}
              </div>
            </div>

            {/* Option 2 */}
            <div
              onClick={() => toggleAlert("traffic")}
              className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl bg-white shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <TriangleAlert size={18} className="text-[#304052]" />
                <span className="text-sm font-medium text-gray-700">
                  อุบัติเหตุ / รถติด
                </span>
              </div>
              <div
                className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${alerts.traffic ? "bg-blue-500 border-blue-500" : "border-gray-200"}`}
              >
                {alerts.traffic && (
                  <div className="w-2 h-1 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />
                )}
              </div>
            </div>

            {/* Option 3 */}
            <div
              onClick={() => toggleAlert("restStop")}
              className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl bg-white shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Store size={18} className="text-[#304052]" />
                <span className="text-sm font-medium text-gray-700">
                  จุดพักรถ / ร้านอาหาร
                </span>
              </div>
              <div
                className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${alerts.restStop ? "bg-blue-500 border-blue-500" : "border-gray-200"}`}
              >
                {alerts.restStop && (
                  <div className="w-2 h-1 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 bg-white border-t border-gray-50">
        <button
          disabled={saving}
          onClick={handleSave}
          className="w-full py-4 bg-[#304052] text-white rounded-2xl font-bold shadow-lg"
        >
          {saving ? (
            <Loader2 className="animate-spin mx-auto" size={20} />
          ) : (
            "บันทึก"
          )}
        </button>
      </div>
    </div>
  );
}
