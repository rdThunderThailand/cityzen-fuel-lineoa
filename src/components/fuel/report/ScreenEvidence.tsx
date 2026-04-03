"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function ScreenEvidence({ data, setData, onNext }: any) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData({ ...data, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      {/* Upload Section */}
      <section>
        <h3 className="font-bold text-gray-800 text-lg mb-4">
          แนบหลักฐาน (ถ้ามี)
        </h3>
        <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-3xl bg-white hover:bg-gray-50 transition-all cursor-pointer overflow-hidden">
          {preview ? (
            <Image
              src={preview}
              className="w-full h-full object-cover"
              alt="Preview"
              width={10}
              height={10}
            />
          ) : (
            <>
              <div className="p-4 bg-gray-50 rounded-full text-gray-400 mb-2">
                <Camera size={32} />
              </div>
              <p className="text-sm font-bold text-gray-400">
                ถ่ายรูปหรือเลือกจากอัลบั้ม
              </p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </section>

      {/* Note Section */}
      <section>
        <h3 className="font-bold text-gray-800 text-sm mb-2 uppercase">
          หมายเหตุเพิ่มเติม
        </h3>
        <textarea
          placeholder="เช่น คิวเริ่มยาวล้นออกมานอกปั๊ม..."
          className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 min-h-[100px]"
          value={data.note}
          onChange={(e) => setData({ ...data, note: e.target.value })}
        />
      </section>

      {/* Time Select */}
      <section>
        <h3 className="font-bold text-gray-800 text-sm mb-3 uppercase">
          เวลาที่พบเห็น
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {["ตอนนี้", "15 นาทีที่แล้ว", "1 ชม. ที่แล้ว"].map((t) => (
            <button
              key={t}
              onClick={() => setData({ ...data, time: t })}
              className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${
                data.time === t
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-500 border-gray-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={onNext}
        className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl"
      >
        ถัดไป
      </button>
    </div>
  );
}
