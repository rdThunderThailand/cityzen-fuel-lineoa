"use client";
import React, { useState } from "react";
import { ChevronLeft, Bell, Info } from "lucide-react";
import Link from "next/link";

export default function NotificationSettingsPage() {
  const [frequency, setFrequency] = useState("frequent"); // default: อัปเดตบ่อย
  const [isTimeEnabled, setIsTimeEnabled] = useState(false);

  const frequencies = [
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
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* --- Header --- */}
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
        {/* --- Section 1: ความถี่ --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
            <Bell size={16} className="text-[#304052]" fill="currentColor" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              ความถี่ในการรับข่าวสาร
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {frequencies.map((f) => (
              <label
                key={f.id}
                className="flex items-start gap-4 px-6 py-5 cursor-pointer active:bg-gray-50 transition-colors"
              >
                <div className="mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      frequency === f.id
                        ? "border-[#304052]"
                        : "border-gray-200"
                    }`}
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
                  <span className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    {f.desc}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* --- Section 2: เวลาที่อนุญาต --- */}
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

              {/* Toggle Switch */}
              <button
                onClick={() => setIsTimeEnabled(!isTimeEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isTimeEnabled ? "bg-blue-500" : "bg-gray-200"}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isTimeEnabled ? "left-7" : "left-1"}`}
                />
              </button>
            </div>

            <div className="flex gap-2 text-[10px] text-gray-400 leading-relaxed italic">
              <div className="shrink-0 mt-0.5">
                <Info size={12} />
              </div>
              <p>
                *เหตุฉุกเฉินระดับวิกฤต จะแจ้งเตือนตลอด 24 ชม.
                เพื่อความปลอดภัยของคุณ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Save Button --- */}
      <div className="mt-auto p-4 bg-white border-t border-gray-50">
        <button
          className="w-full py-4 bg-[#304052] text-white rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-transform"
          onClick={() => alert("บันทึกการตั้งค่าเรียบร้อย")}
        >
          บันทึก
        </button>
      </div>
    </div>
  );
}
