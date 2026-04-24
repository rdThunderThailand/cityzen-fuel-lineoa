"use client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function SearchingPage() {
  const router = useRouter();
  const [staticMapUrl, setStaticMapUrl] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState("");

  useEffect(() => {
    // สร้าง Ticket ID จำลอง
    setTicketId(`#CZ-${Math.floor(10000 + Math.random() * 90000)}`);

    // Redirect to tracking page after 3 seconds
    const timer = setTimeout(() => {
      router.replace("/liff/request-help/tracking");
    }, 3000);

    // Generate map based on saved location or default
    const saved = sessionStorage.getItem("helpFormLocation");
    let lat = 13.7563;
    let lng = 100.5018;
    if (saved) {
      try {
        const data = JSON.parse(saved);
        lat = data.lat;
        lng = data.lng;
      } catch (e) {}
    }
    
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (token) {
      // ดึง static map ของ Mapbox แบบกว้างเพื่อทำเป็นพื้นหลังเรดาร์
      setStaticMapUrl(`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lng},${lat},13,0/600x300?access_token=${token}`);
    }

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-[#304052]">
      {/* --- Header --- */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold pr-6">ค้นหาเจ้าหน้าที่</h1>
      </header>

      <div className="p-4 flex flex-col gap-4">
        {/* Radar Map Area */}
        <div className="relative w-full h-56 bg-blue-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          {staticMapUrl && (
            <Image 
              src={staticMapUrl} 
              alt="Map Background" 
              fill 
              className="object-cover opacity-60 mix-blend-multiply" 
              unoptimized
            />
          )}
          {/* Overlay blue tint */}
          <div className="absolute inset-0 bg-blue-400/20 mix-blend-overlay"></div>
          
          {/* Pulse Effect Area */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Ripples */}
            <div className="absolute w-24 h-24 bg-blue-500/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute w-40 h-40 bg-blue-500/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]"></div>
            <div className="absolute w-56 h-56 bg-blue-500/10 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_1s]"></div>
            
            {/* Center Node */}
            <div className="relative w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 z-10 border-2 border-white">
               {/* Radio wave icon matching screenshot */}
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 12v.01" strokeWidth="4"/>
                  <path d="M8.5 8.5a5 5 0 0 0 0 7" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                  <path d="M5 5a10 10 0 0 0 0 14" />
                  <path d="M19 5a10 10 0 0 1 0 14" />
               </svg>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col items-center">
          <div className="w-full bg-gray-50/30 border-b border-gray-50 px-5 py-4 flex justify-start">
            <span className="font-extrabold text-gray-800 text-[15px]">{ticketId}</span>
          </div>
          
          <div className="p-10 flex flex-col items-center justify-center w-full">
            {/* Blue Arc Spinner */}
            <div className="relative w-20 h-20 mb-8">
              <svg className="animate-spin w-full h-full text-blue-500" viewBox="0 0 50 50">
                <circle className="text-gray-100" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <circle className="text-blue-500" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="90 150" strokeLinecap="round"></circle>
              </svg>
            </div>
            
            <h2 className="text-[22px] font-extrabold text-gray-900 mb-2 tracking-tight">กำลังกระจายสัญญาณ...</h2>
            <p className="text-[#98A2B3] text-[14px] font-medium text-center px-4">
              รอสักครู่ ระบบกำลังจับคู่ผู้ช่วยเหลือในรัศมี 5 กม.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
