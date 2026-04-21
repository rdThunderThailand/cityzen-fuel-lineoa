"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, Bell, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import liff from "@line/liff";
import { reportDb } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State สำหรับเก็บค่าการตั้งค่า
  const [frequency, setFrequency] = useState("frequent");
  const [isTimeEnabled, setIsTimeEnabled] = useState(false);

  // 1. ดึงค่าการตั้งค่าเดิมจาก Database
  useEffect(() => {
    async function loadPreferences() {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID as string });
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const profile = await liff.getProfile();
        const { data, error } = await reportDb
          .from("user_preferences")
          .select("*")
          .eq("user_id", profile.userId)
          .single();

        if (data && !error) {
          setFrequency(data.frequency);
          setIsTimeEnabled(data.is_time_restricted); // สมมติว่าชื่อคอลัมน์นี้นะครับ
        }
      } catch (err) {
        console.error("Load Preferences Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPreferences();
  }, []);

  // 2. ฟังก์ชันบันทึกค่า (Upsert)
  const handleSave = async () => {
    setSaving(true);
    try {
      const profile = await liff.getProfile();

      // 🚀 ลองใส่ console.log เช็กค่าก่อนส่ง
      console.log("Saving for User:", profile.userId);

      const { error } = await reportDb.from("user_preferences").upsert({
        user_id: profile.userId,
        frequency: frequency,
        is_time_restricted: isTimeEnabled, // 🎯 คอลัมน์นี้ต้องมีใน DB
        start_time: "06:00",
        end_time: "22:00",
        updated_at: new Date(),
      });

      if (error) {
        // 🚨 ถ้า Supabase คืน Error มา ให้โชว์ตรงนี้
        throw new Error(error.message);
      }

      alert("บันทึกการตั้งค่าเรียบร้อยครับ!");
      router.push("/liff/area-notification");
    } catch (err: any) {
      console.error("Save Error:", err);
      // 💡 โชว์ข้อความ Error จริงๆ ให้พี่เห็นบนจอมือถือ
      alert(`บันทึกไม่สำเร็จ: ${err.message || "Unknown Error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-10">
        <Link
          href="/liff/area-notification"
          className="p-2 -ml-2 text-gray-400"
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800 mr-8">
          การตั้งค่าแจ้งเตือน
        </h1>
      </header>

      <div className="p-4 space-y-4">
        {/* --- ส่วนเลือกความถี่ --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
            <Bell size={16} className="text-[#304052]" fill="currentColor" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              ความถี่ในการรับข่าวสาร
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {[
              {
                id: "normal",
                title: "ปกติ",
                desc: "แจ้งเฉพาะเหตุสำคัญและสรุปประจำวัน",
              },
              {
                id: "frequent",
                title: "อัปเดตบ่อย",
                desc: "แจ้งทุกความเคลื่อนไหวในพื้นที่",
              },
              {
                id: "urgent",
                title: "เร่งด่วนเท่านั้น",
                desc: "แจ้งเฉพาะวิกฤตหรือภัยพิบัติ",
              },
            ].map((f) => (
              <label
                key={f.id}
                className="flex items-start gap-4 px-6 py-5 cursor-pointer active:bg-gray-50"
              >
                <div className="mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${frequency === f.id ? "border-[#304052]" : "border-gray-200"}`}
                  >
                    {frequency === f.id && (
                      <div className="w-2.5 h-2.5 bg-[#304052] rounded-full" />
                    )}
                  </div>
                  <input
                    type="radio"
                    className="hidden"
                    name="frequency"
                    value={f.id}
                    checked={frequency === f.id}
                    onChange={() => setFrequency(f.id)}
                  />
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-bold ${frequency === f.id ? "text-gray-900" : "text-gray-600"}`}
                  >
                    {f.title}
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5">{f.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* --- ส่วนเลือกช่วงเวลา --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
            <Bell size={16} className="text-[#304052]" fill="currentColor" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              เวลาที่อนุญาตให้แจ้งเตือน
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">
                  ช่วงเวลา
                </span>
                <span className="text-sm font-bold text-blue-500 mt-1">
                  06:00 - 22:00
                </span>
              </div>
              <button
                onClick={() => setIsTimeEnabled(!isTimeEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isTimeEnabled ? "bg-blue-500" : "bg-gray-200"}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isTimeEnabled ? "left-7" : "left-1"}`}
                />
              </button>
            </div>
            <div className="flex gap-2 text-[10px] text-gray-400 italic">
              <Info size={12} className="shrink-0" />
              <p>
                *เหตุฉุกเฉินระดับวิกฤต จะแจ้งเตือนตลอด 24 ชม.
                เพื่อความปลอดภัยของคุณ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 bg-white border-t border-gray-50">
        <button
          disabled={saving}
          onClick={handleSave}
          className="w-full py-4 bg-[#304052] text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : "บันทึก"}
        </button>
      </div>
    </div>
  );
}
