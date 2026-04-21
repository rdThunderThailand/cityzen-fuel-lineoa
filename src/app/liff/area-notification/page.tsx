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

// เพิ่ม Interface สำหรับการตั้งค่า
interface UserPreferences {
  frequency: string;
  isTimeRestricted: boolean;
  startTime: string;
  endTime: string;
}

export default function AlertMainPage() {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [liffInitError, setLiffInitError] = useState<string | null>(null);

  // Helper สำหรับแปลง Code เป็นภาษาไทย
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

        // 1. ดึงข้อมูลพื้นที่ที่ติดตาม (Subscriptions)
        const { data: subs, error: subsError } = await reportDb
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", userId);

        if (subsError) throw subsError;

        // 2. ดึงข้อมูลการตั้งค่าแจ้งเตือน (Preferences)
        const { data: pref, error: prefError } = await reportDb
          .from("user_preferences")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(); // ใช้ maybeSingle เพราะ User ใหม่อาจจะยังไม่มีค่านี้

        if (prefError) throw prefError;

        // Map ข้อมูลพื้นที่
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

        // Map ข้อมูลการตั้งค่า
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

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบพื้นที่นี้ใช่หรือไม่?")) return;
    try {
      const { error } = await reportDb
        .from("user_subscriptions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setSavedLocations(savedLocations.filter((loc) => loc.id !== id));
    } catch (err) {
      alert("ลบข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-10">
        <Link href="/liff" className="p-2 -ml-2 text-gray-400">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800 mr-8">
          แจ้งเตือนพื้นที่
        </h1>
      </header>

      {liffInitError && (
        <div className="m-4 p-4 bg-red-50 rounded-2xl flex items-start gap-3 border border-red-100">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-red-800 font-bold text-sm">ข้อผิดพลาด LIFF</h3>
            <p className="text-red-600 text-xs mt-1">{liffInitError}</p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-6">
        {/* Card 1: การตั้งค่าแจ้งเตือน (ดึงจาก DB จริง) */}
        <div className="bg-white rounded-4xl shadow-sm border border-gray-50 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
            <Bell size={16} className="text-[#304052]" fill="currentColor" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              การตั้งค่าแจ้งเตือน
            </span>
          </div>
          <div className="p-5 flex justify-between items-center">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 py-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">กำลังโหลด...</span>
              </div>
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
              <button className="bg-[#304052] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition">
                ปรับการตั้งค่า
              </button>
            </Link>
          </div>
        </div>

        {/* Section: พื้นที่ของคุณ (ดึงจาก DB จริง) */}
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
              <Plus size={18} strokeWidth={3} />
              เพิ่มพื้นที่
            </div>
          </Link>

          {savedLocations.length > 0
            ? savedLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="mx-1 p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center justify-between animate-in slide-in-from-right-4 duration-300"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      {loc.province} &gt; {loc.district}
                    </span>
                    <span className="text-xs text-gray-400 mt-1 font-medium">
                      แจ้งเตือน: {loc.alertType}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="p-3 bg-[#EBF5FF] text-[#3B82F6] rounded-xl active:scale-90 transition-transform"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            : !loading && (
                <div className="text-center py-4 text-gray-300 text-xs italic">
                  ยังไม่มีพื้นที่ที่ติดตาม
                </div>
              )}
        </div>

        {/* Section: เส้นทางประจำ */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 px-2">
            <Car size={16} className="text-[#304052]" fill="currentColor" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              เส้นทางประจำ
            </span>
          </div>

          <div className="mx-1 py-4 border-2 border-dashed border-blue-200 rounded-2xl flex items-center justify-center gap-2 text-blue-500 font-bold text-sm bg-blue-50/30">
            <Plus size={18} strokeWidth={3} />
            เพิ่มเส้นทางประจำ
          </div>
        </div>
      </div>
    </div>
  );
}
