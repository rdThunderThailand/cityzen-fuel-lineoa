"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Bell,
  MapPin,
  Car,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import liff from "@line/liff";
import { reportDb } from "@/lib/supabase";

interface SavedLocation {
  id: string;
  province: string;
  district: string;
  alertType?: string;
}

// 🎯 อัปเดต Interface ให้รองรับชื่อเรียก (Labels)
interface SavedRoute {
  id: string;
  origin: string;
  destination: string;
  originLabel: string;
  destinationLabel: string;
  alertOptions: string[];
}

interface UserPreferences {
  frequency: string;
  isTimeRestricted: boolean;
  startTime: string;
  endTime: string;
}

export default function AlertMainPage() {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [liffInitError, setLiffInitError] = useState<string | null>(null);

  const frequencyText: Record<string, string> = {
    normal: "ปกติ",
    frequent: "อัปเดตบ่อย",
    urgent: "เร่งด่วนเท่านั้น",
  };

  const alertLabelMap: Record<string, string> = {
    fuel: "ราคาน้ำมันตามเส้นทาง",
    traffic: "อุบัติเหตุ / รถติด",
    restStop: "จุดพักรถ / ร้านอาหาร",
  };

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID;
        if (!liffId)
          throw new Error("NEXT_PUBLIC_LINE_LIFF_ID is not configured");
        await liff.init({ liffId });
        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
        } else {
          loadAllData();
        }
      } catch (err: any) {
        setLiffInitError(err.message || String(err));
        setLoading(false);
      }
    };

    const loadAllData = async () => {
      try {
        const profile = await liff.getProfile();
        const userId = profile.userId;

        const [subsRes, routesRes, prefRes] = await Promise.all([
          reportDb.from("user_subscriptions").select("*").eq("user_id", userId),
          reportDb
            .from("user_routes")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
          reportDb
            .from("user_preferences")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle(),
        ]);

        if (subsRes.data) {
          setSavedLocations(
            subsRes.data.map((item: any) => ({
              id: item.id.toString(),
              province: item.district_name,
              district: item.location_name,
              alertType:
                item.alert_types?.length > 0
                  ? "เหตุฉุกเฉินและอื่นๆ"
                  : "เหตุฉุกเฉิน",
            })),
          );
        }

        // 🎯 Mapping ข้อมูลเส้นทางโดยใช้ Label ที่ตั้งไว้
        if (routesRes.data) {
          setSavedRoutes(
            routesRes.data.map((item: any) => ({
              id: item.id.toString(),
              origin: item.origin,
              destination: item.destination,
              originLabel: item.origin_label || item.origin, // ถ้าไม่มีชื่อเรียก ให้ใช้ที่อยู่แทน
              destinationLabel: item.destination_label || item.destination,
              alertOptions: item.alert_options || [],
            })),
          );
        }

        if (prefRes.data) {
          setPreferences({
            frequency: prefRes.data.frequency,
            isTimeRestricted: prefRes.data.is_time_restricted,
            startTime: prefRes.data.start_time?.slice(0, 5) || "06:00",
            endTime: prefRes.data.end_time?.slice(0, 5) || "22:00",
          });
        }
      } catch (e) {
        console.error("Error loading data:", e);
      } finally {
        setLoading(false);
      }
    };
    initLiff();
  }, []);

  const handleDeleteLocation = async (id: string) => {
    if (!confirm("คุณต้องการลบพื้นที่นี้ใช่หรือไม่?")) return;
    try {
      await reportDb.from("user_subscriptions").delete().eq("id", id);
      setSavedLocations(savedLocations.filter((loc) => loc.id !== id));
    } catch (err) {
      alert("ลบข้อมูลไม่สำเร็จ");
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm("คุณต้องการลบเส้นทางนี้ใช่หรือไม่?")) return;
    try {
      await reportDb.from("user_routes").delete().eq("id", id);
      setSavedRoutes(savedRoutes.filter((r) => r.id !== id));
    } catch (err) {
      alert("ลบเส้นทางไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-[#304052]">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-10">
        <Link href="/liff" className="p-2 -ml-2 text-gray-400">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800 mr-8">
          แจ้งเตือนพื้นที่
        </h1>
      </header>

      <div className="p-4 space-y-6">
        {/* --- การตั้งค่าแจ้งเตือน --- */}
        <div className="bg-white rounded-4xl shadow-sm border border-gray-50 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2 bg-gray-50/30">
            <Bell size={16} fill="currentColor" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              การตั้งค่าแจ้งเตือน
            </span>
          </div>
          <div className="p-5 flex justify-between items-center">
            {loading ? (
              <Loader2 className="animate-spin text-gray-300" size={20} />
            ) : (
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  ความถี่:{" "}
                  {preferences ? frequencyText[preferences.frequency] : "ปกติ"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  เวลา:{" "}
                  {preferences?.isTimeRestricted
                    ? `${preferences.startTime} - ${preferences.endTime}`
                    : "ตลอด 24 ชม."}
                </p>
              </div>
            )}
            <Link href="/liff/area-notification/preferences">
              <button className="bg-[#304052] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">
                ปรับการตั้งค่า
              </button>
            </Link>
          </div>
        </div>

        {/* --- พื้นที่ของคุณ --- */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <MapPin size={16} fill="currentColor" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              พื้นที่ของคุณ
            </span>
          </div>
          <Link
            href="/liff/area-notification/add-location"
            className="block px-1"
          >
            <div className="w-full py-4 border-2 border-dashed border-blue-200 rounded-2xl flex items-center justify-center gap-2 text-blue-500 font-bold text-sm bg-blue-50/30">
              <Plus size={18} strokeWidth={3} /> เพิ่มพื้นที่
            </div>
          </Link>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-gray-300" size={20} />
            </div>
          ) : savedLocations.length > 0 ? (
            savedLocations.map((loc) => (
              <div
                key={loc.id}
                className="mx-1 p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800">
                    {loc.province} &gt; {loc.district}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    แจ้งเตือน: {loc.alertType}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteLocation(loc.id)}
                  className="p-3 bg-[#EBF5FF] text-[#3B82F6] rounded-xl"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-300 text-xs italic">
              ยังไม่มีพื้นที่ที่ติดตาม
            </div>
          )}
        </div>

        {/* --- เส้นทางประจำ --- */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 px-2">
            <Car size={16} fill="currentColor" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              เส้นทางประจำ
            </span>
          </div>
          <Link href="/liff/area-notification/add-route" className="block px-1">
            <div className="w-full py-4 border-2 border-dashed border-blue-200 rounded-2xl flex items-center justify-center gap-2 text-blue-500 font-bold text-sm bg-blue-50/30">
              <Plus size={18} strokeWidth={3} /> เพิ่มเส้นทางประจำ
            </div>
          </Link>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-gray-300" size={20} />
            </div>
          ) : savedRoutes.length > 0 ? (
            savedRoutes.map((route) => (
              <div
                key={route.id}
                className="mx-1 p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center justify-between animate-in slide-in-from-right-4 duration-300"
              >
                <div className="flex flex-col flex-1 pr-4">
                  {/* 🎯 แสดงชื่อเรียก (Label) ที่ตั้งไว้ */}
                  <span className="text-sm font-bold text-gray-800 line-clamp-1">
                    {route.originLabel} - {route.destinationLabel}
                  </span>
                  <span className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">
                    แจ้งเตือน:{" "}
                    {route.alertOptions.length > 0
                      ? route.alertOptions
                          .map((opt) => alertLabelMap[opt] || opt)
                          .join(", ")
                      : "ทั่วไป"}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteRoute(route.id)}
                  className="p-3 bg-[#EBF5FF] text-[#3B82F6] rounded-xl active:scale-90 transition-transform"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-300 text-xs italic">
              ยังไม่มีเส้นทางที่บันทึกไว้
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
