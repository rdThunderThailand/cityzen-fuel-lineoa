"use client";
import { ChevronLeft, MapPin, AlertCircle, Image as ImageIcon, Fuel, Droplet, Utensils, Stethoscope, Zap, CarFront, MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "others";

  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [details, setDetails] = useState("");
  const [images, setImages] = useState<any[]>([]);

  const typeMap: Record<string, string> = {
    fuel: "น้ำมัน",
    water: "น้ำดื่ม",
    food: "อาหาร",
    medical: "การแพทย์",
    electricity: "ไฟฟ้า",
    travel: "การเดินทาง",
    others: "อื่นๆ",
  };

  const getIcon = () => {
    switch(type) {
      case "fuel": return <Fuel size={24} className="text-[#304052]" />;
      case "water": return <Droplet size={24} className="text-[#304052]" />;
      case "food": return <Utensils size={24} className="text-[#304052]" />;
      case "medical": return <Stethoscope size={24} className="text-[#304052]" />;
      case "electricity": return <Zap size={24} className="text-[#304052]" />;
      case "travel": return <CarFront size={24} className="text-[#304052]" />;
      default: return <MoreHorizontal size={24} className="text-[#304052]" />;
    }
  };

  useEffect(() => {
    // Load data from sessionStorage
    const locSaved = sessionStorage.getItem("helpFormLocation");
    if (locSaved) {
      try {
        const data = JSON.parse(locSaved);
        setAddress(data.address);
        setLandmark(data.landmark);
      } catch (e) {
        console.error(e);
      }
    }

    const detSaved = sessionStorage.getItem("helpFormDetails");
    if (detSaved) {
      try {
        const data = JSON.parse(detSaved);
        setDetails(data.details);
      } catch (e) {
        console.error(e);
      }
    }

    const imgSaved = sessionStorage.getItem("helpFormImages");
    if (imgSaved) {
      try {
        const data = JSON.parse(imgSaved);
        setImages(data);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFirstImageText = () => {
    if (images.length === 0) return "ไม่มีรูปภาพแนบ";
    const first = images[0];
    return `${first.name} (${formatSize(first.size)})`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-[#304052]">
      {/* --- Header --- */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold">ตรวจสอบก่อนส่ง</h1>
      </header>

      <div className="p-4 flex-1">
        <div className="bg-white rounded-[1.25rem] border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Header Row */}
          <div className="p-4 border-b border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
               {getIcon()}
            </div>
            <h2 className="font-bold text-[15px] text-gray-800">{typeMap[type]}</h2>
          </div>

          {/* Location Row */}
          <div className="p-4 border-b border-gray-50 space-y-2">
            <div className="flex gap-3">
              <MapPin size={18} fill="currentColor" className="text-[#304052] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-800 text-[13px]">{address || "ไม่ระบุตำแหน่ง"}</p>
                {landmark && (
                  <p className="text-[#98A2B3] text-[13px] mt-1">จุดสังเกต: {landmark}</p>
                )}
              </div>
            </div>
          </div>

          {/* Details Row */}
          <div className="p-4 border-b border-gray-50 space-y-2">
            <div className="flex gap-3">
              <AlertCircle size={18} fill="currentColor" className="text-[#304052] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-800 text-[13px]">รายละเอียดเพิ่มเติม</p>
                <p className="text-[#98A2B3] text-[13px] mt-1">{details || "-"}</p>
              </div>
            </div>
          </div>

          {/* Images Row */}
          <div className="p-4 bg-gray-50/50">
            <div className="flex items-center gap-4">
              <ImageIcon size={24} className="text-blue-500 shrink-0" strokeWidth={1.5} />
              <div className="flex-1 flex justify-between items-center text-[13px]">
                <span className="font-medium text-gray-800 truncate pr-2">
                  {getFirstImageText()}
                </span>
                <span className="text-[#98A2B3] shrink-0">
                  แนบรูปภาพแล้ว {images.length} รูป
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- Footer Button --- */}
      <div className="p-4 bg-white border-t border-gray-50 mt-auto">
        <button
          onClick={() => {
            router.push("/liff/request-help/success");
          }}
          className="w-full py-4 bg-[#304052] text-white rounded-xl font-bold text-base shadow-lg active:scale-[0.98] transition-transform"
        >
          ยืนยันส่งคำขอ
        </button>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">กำลังโหลด...</div>}>
      <ReviewContent />
    </Suspense>
  );
}
