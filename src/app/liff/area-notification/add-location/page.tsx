"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, Search, MapPin, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { reportDb } from "@/lib/supabase";
import liff from "@line/liff";
// นำเข้า Service ที่เราเขียนเพิ่มไว้ใน thunder-core.ts
import {
  fetchProvincesFromStations,
  fetchDistrictsFromStations,
} from "@/services/thunder-core";

export default function AddLocationPage() {
  const router = useRouter();

  // State สำหรับเก็บข้อมูลจาก API
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State คุมลำดับการเลือก
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. โหลดจังหวัดทั้งหมดที่มีปั๊มในระบบตอนเปิดหน้า
  useEffect(() => {
    async function loadProvinces() {
      setIsLoading(true);
      const data = await fetchProvincesFromStations();
      setProvinces(data);
      setIsLoading(false);
    }
    loadProvinces();
  }, []);

  // 2. เมื่อเลือกจังหวัด ให้ไปโหลดอำเภอต่อ
  const handleProvinceSelect = async (province: string) => {
    setSelectedProvince(province);
    setSelectedDistrict(null); // รีเซ็ตอำเภอเก่า
    setSearchQuery(""); // ล้างช่องค้นหา

    setIsLoading(true);
    const data = await fetchDistrictsFromStations(province);
    setDistricts(data);
    setIsLoading(false);
  };

  // ฟังก์ชันรีเซ็ตกลับไปเลือกจังหวัดใหม่
  const handleClear = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setSearchQuery("");
  };

  // กรองข้อมูลตามที่พิมพ์ค้นหา
  const displayList = !selectedProvince ? provinces : districts;
  const filteredList = displayList.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleConfirm = async () => {
    if (!selectedProvince || !selectedDistrict) return;

    try {
      // 🚀 1. ตรวจสอบและ Initialize LIFF ก่อน
      if (!liff.isLoggedIn()) {
        await liff.init({
          liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID as string,
        });
        // ถ้ายังไม่ Login ให้สั่ง Login ก่อน (กันเหนียว)
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }
      }

      // 🚀 2. ดึง Profile หลังจากมั่นใจว่า Init แล้ว
      const profile = await liff.getProfile();
      const userId = profile.userId;

      // 3. บันทึกลง Supabase (Alert DB)
      const { error } = await reportDb.from("user_subscriptions").insert({
        user_id: userId,
        location_name: selectedDistrict,
        district_name: selectedProvince,
        alert_types: ["fuel", "emergency"],
      });

      if (error) throw error;
      router.push("/liff/area-notification");
    } catch (err) {
      console.error("บันทึกไม่สำเร็จ:", err);
      alert("Error: กรุณาเปิดผ่านแอป LINE หรือเช็คการตั้งค่า LIFF ID");
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
          เพิ่มพื้นที่
        </h1>
      </header>

      {/* --- Search Section --- */}
      <div className="p-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm placeholder-gray-400 outline-none shadow-sm focus:ring-2 focus:ring-blue-100 transition-all"
            placeholder={
              !selectedProvince ? "ค้นหาจังหวัด..." : "ค้นหาอำเภอ/เทศบาล..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 pb-10 space-y-4">
        {/* --- Card แสดงสถานะการเลือก (Timeline) --- */}
        {selectedProvince && (
          <div className="bg-white rounded-4xl shadow-sm border border-gray-50 p-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-5">
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                พื้นที่ที่เลือก
              </span>
              <button
                onClick={handleClear}
                className="text-[10px] font-bold text-gray-400"
              >
                ล้าง
              </button>
            </div>

            <div className="relative ml-1 space-y-6">
              <div className="absolute left-[3.5px] top-[8px] bottom-[8px] w-px bg-gray-100"></div>

              <div className="flex items-center gap-4 relative">
                <div className="w-2 h-2 rounded-full border-2 border-[#304052] bg-white z-10"></div>
                <span className="text-sm font-medium text-gray-700">
                  {selectedProvince}
                </span>
              </div>

              <div className="flex items-center gap-4 relative">
                <div
                  className={`w-2 h-2 rounded-full border-2 z-10 bg-white transition-colors ${selectedDistrict ? "border-[#304052]" : "border-blue-500"}`}
                ></div>
                <span
                  className={`text-sm transition-all ${selectedDistrict ? "font-medium text-gray-700" : "font-bold text-blue-500 underline decoration-dotted underline-offset-4"}`}
                >
                  {selectedDistrict || "เลือก อำเภอ/เทศบาล"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* --- รายการให้เลือก (Dynamic List) --- */}
        <div className="bg-white rounded-4xl shadow-sm border border-gray-50 overflow-hidden min-h-[200px] relative">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="text-[#304052]">
                <MapPin size={18} fill="currentColor" />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {!selectedProvince ? "เลือกจังหวัด" : "เลือกเขต/อำเภอ"}
              </span>
            </div>
            {isLoading && (
              <Loader2 size={16} className="animate-spin text-blue-500" />
            )}
          </div>

          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    !selectedProvince
                      ? handleProvinceSelect(item)
                      : setSelectedDistrict(item)
                  }
                  className={`w-full px-6 py-5 text-left text-sm font-medium transition-colors flex justify-between items-center ${
                    selectedDistrict === item
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 active:bg-blue-50"
                  }`}
                >
                  {item}
                  {selectedDistrict === item && <Check size={16} />}
                </button>
              ))
            ) : (
              <div className="p-10 text-center text-sm text-gray-400">
                {isLoading ? "กำลังโหลดข้อมูล..." : "ไม่พบข้อมูลที่ค้นหา"}
              </div>
            )}
          </div>
        </div>

        {/* ปุ่มยืนยัน */}
        {selectedProvince && selectedDistrict && (
          <button
            className="w-full py-4 bg-[#304052] text-white rounded-2xl font-bold shadow-lg animate-in fade-in zoom-in-95 duration-300"
            onClick={handleConfirm}
          >
            ยืนยันพื้นที่นี้
          </button>
        )}
      </div>
    </div>
  );
}
