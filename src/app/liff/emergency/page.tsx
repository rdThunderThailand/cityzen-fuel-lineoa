"use client";
import { ChevronLeft, ShieldAlert, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmergencyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#ff4d4f] flex flex-col font-sans text-white">
      {/* --- Header --- */}
      <header className="bg-white text-[#304052] px-4 py-4 flex items-center sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold pr-6">เหตุฉุกเฉินด่วน</h1>
      </header>

      <div className="flex-1 flex flex-col items-center px-6 pt-12 pb-8">
        {/* Shield Icon */}
        <div className="mb-6">
          <ShieldAlert size={80} className="text-white" strokeWidth={1.5} />
        </div>

        {/* Text */}
        <h2 className="text-[24px] font-extrabold mb-3 text-center">เหตุฉุกเฉินด่วน</h2>
        <p className="text-white/80 text-[14px] text-center mb-10 leading-relaxed font-medium">
          หากท่านตกอยู่ในอันตรายถึงชีวิต
          <br />
          โปรดเลือกช่องทางติดต่อด้านล่างเพื่อความรวดเร็วที่สุด
        </p>

        {/* Phone Cards */}
        <div className="w-full flex flex-col gap-4">
          
          {/* Card 1669 */}
          <a href="tel:1669" className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-red-900/20 active:scale-[0.98] transition-transform">
            <div>
              <h3 className="text-[#ff4d4f] text-[20px] font-extrabold mb-1">โทร 1669</h3>
              <p className="text-[#ff4d4f]/60 text-[13px] font-medium">สายด่วนการแพทย์ฉุกเฉิน</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
              <Phone size={22} className="text-[#ff4d4f] fill-[#ff4d4f]" />
            </div>
          </a>

          {/* Card 191 */}
          <a href="tel:191" className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-red-900/20 active:scale-[0.98] transition-transform">
            <div>
              <h3 className="text-[#304052] text-[20px] font-extrabold mb-1">โทร 191</h3>
              <p className="text-gray-400 text-[13px] font-medium">เหตุด่วนเหตุร้าย / ตำรวจ</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <Phone size={22} className="text-[#1e3a8a] fill-[#1e3a8a]" />
            </div>
          </a>

        </div>
      </div>
    </div>
  );
}
