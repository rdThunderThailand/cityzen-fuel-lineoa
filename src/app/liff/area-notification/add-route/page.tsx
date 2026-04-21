"use client";
import { reportDb } from "@/lib/supabase";
import liff from "@line/liff";
import {
  Bell,
  ChevronLeft,
  Loader2,
  MapPin,
  Store,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddRoutePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // State สำหรับเก็บข้อมูล
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [alerts, setAlerts] = useState({
    fuel: false,
    traffic: false,
    restStop: false,
  });

  const toggleAlert = (key: keyof typeof alerts) => {
    setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!origin || !destination) {
      alert("กรุณากรอกต้นทางและปลายทางครับ");
      return;
    }

    setSaving(true);
    try {
      const profile = await liff.getProfile();

      // แปลง options ที่เลือกเป็น array
      const selectedOptions = Object.keys(alerts).filter(
        (key) => alerts[key as keyof typeof alerts],
      );

      const { error } = await reportDb.from("user_routes").insert({
        user_id: profile.userId,
        origin,
        destination,
        alert_options: selectedOptions,
      });

      if (error) throw error;

      alert("บันทึกเส้นทางเรียบร้อย!");
      router.push("/liff/area-notification");
    } catch (err: any) {
      console.error(err);
      alert("บันทึกไม่สำเร็จ: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* --- Header --- */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-10">
        <Link
          href="/liff/area-notification"
          className="p-2 -ml-2 text-gray-400"
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800 mr-8">
          เพิ่มเส้นทางประจำ
        </h1>
      </header>

      <div className="p-4 space-y-4">
        {/* --- Section 1: ระบุพิกัด --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={18} className="text-[#304052]" fill="currentColor" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              พื้นที่ของคุณ
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">
                ต้นทาง
              </label>
              <input
                type="text"
                placeholder="ค้นหาสถานที่..."
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">
                ปลายทาง
              </label>
              <input
                type="text"
                placeholder="ค้นหาสถานที่..."
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* --- Section 2: เลือกการแจ้งเตือน --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
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

      {/* --- Save Button --- */}
      <div className="mt-auto p-4 bg-white border-t border-gray-50">
        <button
          disabled={saving}
          onClick={handleSave}
          className="w-full py-4 bg-[#304052] text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : "บันทึก"}
        </button>
      </div>
    </div>
  );
}
