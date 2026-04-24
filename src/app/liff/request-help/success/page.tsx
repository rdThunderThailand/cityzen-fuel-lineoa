"use client";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // หน่วงเวลา 2.5 วินาทีแล้วไปหน้าค้นหาเจ้าหน้าที่
    const timer = setTimeout(() => {
      router.replace("/liff/request-help/searching");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans text-[#304052] p-4">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-[#52C41A] rounded-full flex items-center justify-center shadow-lg shadow-green-100 mb-2">
          <Check size={40} color="white" strokeWidth={3.5} />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">ส่งคำขอสำเร็จ</h1>
          <div className="text-[15px] text-[#98A2B3] leading-relaxed font-medium">
            <p>ระบบได้รับข้อมูลและพิกัดของคุณแล้ว</p>
            <p>กำลังหาอาสาสมัคร...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
