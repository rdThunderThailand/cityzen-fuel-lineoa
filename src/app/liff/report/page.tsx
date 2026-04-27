// src/app/liff/report/page.tsx
"use client";
import { ScreenSelectStation } from "@/components/report/ScreenSelectStation";
import { fetchNearbyStations } from "@/services/thunder-core";
import { Station } from "@/types/fuel";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

type ReportStep = 1 | 2 | 3 | 4 | 5;

export default function ReportPage() {
  const [step, setStep] = useState<ReportStep>(1);
  const [loading, setLoading] = useState(true);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);

  // Data State
  const [reportData, setReportData] = useState({
    station: null as any,
    status: "",
    fuels: [] as string[],
    note: "",
    time: "ตอนนี้",
    image: null,
  });

  // Step 1: Auto-fetch nearby stations
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const data = await fetchNearbyStations(
        pos.coords.latitude,
        pos.coords.longitude,
      );
      setNearbyStations(data);
      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f4f4] pb-24 font-sans">
      {/* Header */}
      <header className="bg-white px-4 pt-10 pb-4 sticky top-0 z-10 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={() => window.history.back()}
          className="p-2 -ml-2 text-gray-500"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-medium text-gray-800">แจ้งสถานการณ์ปั๊ม</h1>
        <div className="w-10" />
      </header>

      {/* Progress Bar Area */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between relative">
          {/* Line behind the dots */}
          <div className="absolute top-1.5 left-[10%] right-[10%] h-[2px] bg-gray-100 z-0"></div>
          <div className="absolute top-1.5 left-[10%] w-[10%] h-[2px] bg-blue-600 z-0"></div>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center gap-2 w-1/4">
            <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white"></div>
            <span className="text-[10px] text-blue-600 font-medium text-center">
              แจ้งสถานการณ์ปั๊ม
            </span>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center gap-2 w-1/4">
            <div className="w-3 h-3 rounded-full bg-gray-200 ring-4 ring-white"></div>
            <span className="text-[10px] text-gray-400 text-center">
              เลือกสถานะ
            </span>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center gap-2 w-1/4">
            <div className="w-3 h-3 rounded-full bg-gray-200 ring-4 ring-white"></div>
            <span className="text-[10px] text-gray-400 text-center">
              ข้อมูลเพิ่มเติม
            </span>
          </div>

          {/* Step 4 */}
          <div className="relative z-10 flex flex-col items-center gap-2 w-1/4">
            <div className="w-3 h-3 rounded-full bg-gray-200 ring-4 ring-white"></div>
            <span className="text-[10px] text-gray-400 text-center">
              ตรวจสอบก่อนส่ง
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {step === 1 && (
          <ScreenSelectStation
            stations={nearbyStations}
            loading={loading}
            selectedStation={reportData.station}
            onSelect={(s: Station) => {
              setReportData({ ...reportData, station: s });
            }}
          />
        )}
      </div>

      {/* Fixed Bottom Button */}
      {step === 1 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <button
            disabled={!reportData.station}
            onClick={() => {
              if (reportData.station) {
                const targetUrl = `https://thundercore.vercel.app/r/${reportData.station.id}`;
                window.location.href = targetUrl;
              }
            }}
            className="w-full py-3.5 rounded-xl text-white font-medium text-sm bg-[#34445c] disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
          >
            ถัดไป
          </button>
        </div>
      )}
    </main>
  );
}
