"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, MapPin, Info, Camera, Plus, Loader2 } from "lucide-react";
import Link from "next/link";

export default function HelpFormPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "others";

  const [details, setDetails] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [address, setAddress] = useState("กำลังดึงพิกัดของคุณ...");

  // Mapping ชื่อประเภท
  const typeMap: Record<string, string> = {
    fuel: "น้ำมัน",
    water: "น้ำดื่ม",
    food: "อาหาร",
    medical: "การแพทย์",
    electricity: "ไฟฟ้า",
    travel: "การเดินทาง",
    others: "อื่นๆ",
  };

  useEffect(() => {
    // จำลองการดึงตำแหน่ง
    setTimeout(() => {
      setAddress("ซอยบงกช 8, พัทยากลาง");
      setLoadingLocation(false);
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-[#304052]">
      {/* --- Header --- */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-gray-400"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold">
          ขอความช่วยเหลือ : {typeMap[type]}
        </h1>
      </header>

      <div className="p-4 space-y-4 flex-1">
        {/* --- Section 1: Location Card --- */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-1">
            <div className="flex items-center justify-between border-2 border-blue-500 rounded-xl px-4 py-2 bg-blue-50/30">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <MapPin size={16} fill="currentColor" />
                ตำแหน่งของคุณ
              </div>
              <button className="text-blue-500 text-sm font-bold">
                เปลี่ยน
              </button>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm">{address}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-tighter">
                พัทยา, ชลบุรี
              </p>
            </div>

            {/* Mini Map Placeholder (ตามรูป) */}
            <div className="w-24 h-12 bg-gray-100 rounded-lg relative overflow-hidden flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
                  backgroundSize: "10px 10px",
                }}
              ></div>
              <MapPin
                size={16}
                className="text-blue-500 relative z-10"
                fill="currentColor"
              />
            </div>
          </div>
        </div>

        {/* --- Section 2: Details Card --- */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2 bg-gray-50/30">
            <Info size={16} fill="currentColor" className="text-[#304052]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              รายละเอียดความช่วยเหลือ
            </span>
          </div>
          <div className="p-4">
            <textarea
              className="w-full h-24 p-3 bg-gray-50 rounded-xl text-sm outline-none border border-gray-100 focus:border-blue-200 transition-all"
              placeholder="เพิ่มรายละเอียดเพิ่มเติม..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
        </div>

        {/* --- Section 3: Photo Upload Card --- */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2 bg-gray-50/30">
            <Camera size={16} fill="currentColor" className="text-[#304052]" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                แนบรูปภาพ
              </span>
              <span className="text-[10px] text-gray-400 font-medium lowercase italic">
                เช่น ป้ายหมด, แถวคิวรอเติม
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="w-full h-32 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-1 text-gray-400 active:bg-gray-50 transition-colors cursor-pointer">
              <Plus size={24} />
              <span className="text-xs font-bold">เพิ่มรูปภาพ</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Footer Button --- */}
      <div className="p-4 bg-white border-t border-gray-50 mt-auto">
        <button
          onClick={() => router.push(`/liff/request-help/review?type=${type}`)}
          className="w-full py-4 bg-[#304052] text-white rounded-xl font-bold text-base shadow-lg active:scale-[0.98] transition-transform"
        >
          ตรวจสอบข้อมูล
        </button>
      </div>
    </div>
  );
}
