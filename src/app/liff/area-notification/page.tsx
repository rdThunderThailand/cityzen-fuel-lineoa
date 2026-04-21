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
  Navigation,
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

// เพิ่ม Interface สำหรับเส้นทาง
interface SavedRoute {
  id: string;
  origin: string;
  destination: string;
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
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]); // State สำหรับเส้นทาง
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [liffInitError, setLiffInitError] = useState<string | null>(null);

  const frequencyText: Record<string, string> = {
    normal: "ปกติ",
    frequent: "อัปเดตบ่อย",
    urgent: "เร่งด่วนเท่านั้น",
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

        // 1. ดึงพื้นที่ (Subscriptions)
        const { data: subs, error: subsError } = await reportDb
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", userId);

        if (subsError) throw subsError;

        // 2. ดึงเส้นทาง (Routes) - เพิ่มตรงนี้
        const { data: routes, error: routesError } = await reportDb
          .from("user_routes")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (routesError) throw routesError;

        // 3. ดึงการตั้งค่า (Preferences)
        const { data: pref, error: prefError } = await reportDb
          .from("user_preferences")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (prefError) throw prefError;

        // Map พื้นที่
        if (subs) {
          setSavedLocations(
            subs.map((item: any) => ({
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

        // Map เส้นทาง - เพิ่มตรงนี้
        if (routes) {
          setSavedRoutes(
            routes.map((item: any) => ({
              id: item.id.toString(),
              origin: item.origin,
              destination: item.destination,
              alertOptions: item.alert_options || [],
            })),
          );
        }

        if (pref) {
          setPreferences({
            frequency: pref.frequency,
            isTimeRestricted: pref.is_time_restricted,
            startTime: pref.start_time?.slice(0, 5) || "06:00",
            endTime: pref.end_time?.slice(0, 5) || "22:00",
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

  // ฟังก์ชันลบพื้นที่
  const handleDeleteLocation = async (id: string) => {
    if (!confirm("คุณต้องการลบพื้นที่นี้ใช่หรือไม่?")) return;
    try {
      const { error } = await reportDb
        .from("user_subscriptions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setSavedLocations(savedLocations.filter((loc) => loc.id !== id));
    } catch (err) {
      alert("ลบข้อมูลไม่สำเร็จ");
    }
  };

  // ฟังก์ชันลบเส้นทาง - เพิ่มตรงนี้
  const handleDeleteRoute = async (id: string) => {
    if (!confirm("คุณต้องการลบเส้นทางนี้ใช่หรือไม่?")) return;
    try {
      const { error } = await reportDb
        .from("user_routes")
        .delete()
        .eq("id", id);
      if (error) throw error;
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

      {liffInitError && (
        <div className="m-4 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <p className="text-red-600 text-xs">{liffInitError}</p>
        </div>
      )}

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
            <MapPin size={16} className="text-[#304052]" fill="currentColor" />
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

          {/* 🎯 จุดที่แก้ไข: เช็ค loading และความยาวของ array */}
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

        {/* --- เส้นทางประจำ (เชื่อม Database แล้ว) --- */}
        <div className="space-y-3">
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

          {savedRoutes.map((route) => (
            <div
              key={route.id}
              className="mx-1 p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-right-4"
            >
              <div className="flex flex-col flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <Navigation size={14} className="text-blue-500" />
                  <span className="text-sm font-bold text-gray-800 truncate">
                    {route.origin} - {route.destination}
                  </span>
                </div>
                <span className="text-xs text-gray-400 mt-1 font-medium italic">
                  รับแจ้ง:{" "}
                  {route.alertOptions.length > 0
                    ? route.alertOptions.join(", ")
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
          ))}

          {!loading && savedRoutes.length === 0 && (
            <div className="text-center py-4 text-gray-300 text-xs italic">
              ยังไม่มีเส้นทางที่บันทึกไว้
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
