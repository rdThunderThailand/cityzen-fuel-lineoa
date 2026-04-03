"use client";

import { useParams } from "next/navigation";
import { PrintLabel } from "@/components/fuel/PrintLabel";
import { Printer } from "lucide-react";

export default function QRPrintPage() {
  const params = useParams();
  const stationId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-sm mb-8 animate-in fade-in slide-in-from-bottom-4">
        <PrintLabel stationCode={stationId} />
        
        <button 
          onClick={() => window.print()} 
          className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <Printer size={20} />
          <span>พิมพ์ QR Code</span>
        </button>
      </div>

      <p className="text-gray-400 text-xs text-center max-w-xs">
        * คุณสามารถนำ URL หรือ Component นี้ ไปประยุกต์ใช้กับระบบจัดการหลังบ้านเพื่อสั่งพิมพ์ได้โดยไม่ต้องใช้ไฟล์ภาพ
      </p>
    </div>
  );
}
