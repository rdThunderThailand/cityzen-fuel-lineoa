import { reportDb } from "@/lib/supabase";
import Image from "next/image";
import { useState } from "react";

export function ScreenReview({ data, onSubmit }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let imageUrl = null;

      // 1. อัปโหลดรูปลง Report DB Storage
      if (data.image) {
        const fileExt = data.image.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: uploadData } = await reportDb.storage
          .from("report-images")
          .upload(fileName, data.image);

        if (uploadData) imageUrl = fileName;
      }

      // 2. บันทึกลงตาราง reports (ใน DB แยก)
      await reportDb.from("fuel_reports").insert({
        station_id: data.station.id,
        status: data.status,
        fuels: data.fuels,
        note: data.note,
        observed_at_label: data.time,
        image_url: imageUrl,
        reported_by: "USER_LINE_ID", // ดึงจาก liff.getProfile()
      });

      onSubmit(); // ไปหน้า Success
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 space-y-4">
        <h3 className="text-center font-bold text-gray-400 uppercase text-xs tracking-widest">
          ตรวจสอบข้อมูล
        </h3>

        <SummaryItem label="ปั๊ม" value={data.station?.name} />
        <SummaryItem label="สถานะ" value={data.status} isStatus />
        <SummaryItem label="เชื้อเพลิง" value={data.fuels.join(", ")} />
        <SummaryItem label="เวลา" value={data.time} />

        {data.image && (
          <div className="pt-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
              รูปภาพประกอบ
            </p>
            <Image
              src={URL.createObjectURL(data.image)}
              className="w-full h-32 object-cover rounded-2xl"
              width={10}
              height={10}
            />
          </div>
        )}
      </div>

      <button
        disabled={isSubmitting}
        onClick={handleSubmit}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3"
      >
        {isSubmitting ? "กำลังส่งรายงาน..." : "ส่งรายงาน"}
      </button>
    </div>
  );
}

function SummaryItem({ label, value, isStatus }: any) {
  return (
    <div className="flex justify-between items-start border-b border-gray-50 pb-3">
      <span className="text-sm text-gray-400">{label}</span>
      <span
        className={`text-sm font-bold text-right max-w-[60%] ${isStatus ? "text-red-600" : "text-gray-800"}`}
      >
        {value || "-"}
      </span>
    </div>
  );
}
