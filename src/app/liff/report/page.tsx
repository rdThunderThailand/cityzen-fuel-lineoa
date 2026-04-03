// src/app/liff/report/page.tsx
"use client";
import { ScreenSelectStation } from "@/components/fuel/report/ScreenSelectStation";
import { ScreenStatusSelection } from "@/components/fuel/report/ScreenStatusSelection";
import { fetchNearbyStations } from "@/services/thunder-core";
import { Station } from "@/types/fuel";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

type ReportStep = 1 | 2 | 3 | 4 | 5;

export default function ReportPage() {
  const [step, setStep] = useState<ReportStep>(1);
  const [loading, setLoading] = useState(true);
  const [nearbyStations, setNearbyStations] = useState<any[]>([]);

  // Data State
  const [reportData, setReportData] = useState({
    station: null as any,
    status: "",
    fuels: [] as string[],
    note: "",
    time: "ตอนนี้",
    image: null as any,
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

  const nextStep = () => setStep((prev) => (prev + 1) as ReportStep);
  const prevStep = () => setStep((prev) => (prev - 1) as ReportStep);

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      {/* Header & Progress Bar */}
      <header className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          {step > 1 && step < 5 ? (
            <button onClick={prevStep} className="p-2 -ml-2 text-gray-400">
              <ChevronLeft />
            </button>
          ) : (
            <div className="w-10" />
          )}
          <h1 className="text-lg font-bold text-gray-900">แจ้งสถานการณ์ปั๊ม</h1>
          <div className="w-10" />
        </div>
        {step < 5 && (
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        )}
      </header>

      <div className="p-4">
        {step === 1 && (
          <ScreenSelectStation
            stations={nearbyStations}
            loading={loading}
            onSelect={(s: Station) => {
              setReportData({ ...reportData, station: s });
              nextStep();
            }}
          />
        )}
        {step === 2 && (
          <ScreenStatusSelection
            data={reportData}
            setData={setReportData}
            onNext={nextStep}
          />
        )}
        {/* {step === 3 && (
          <ScreenEvidence
            data={reportData}
            setData={setReportData}
            onNext={nextStep}
          />
        )}
        {step === 4 && <ScreenReview data={reportData} onSubmit={nextStep} />}
        {step === 5 && <ScreenSuccess />} */}
      </div>
    </main>
  );
}
