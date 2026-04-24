"use client";
import { ChevronLeft, Star, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

const feedbackTags = [
  "มาถึงรวดเร็ว",
  "สุภาพอัธยาศัยดี",
  "แก้ปัญหาได้ตรงจุด",
  "อุปกรณ์พร้อม",
  "ให้คำแนะนำดี",
];

export default function RatingPage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    // Submit rating logic here
    alert("ขอบคุณสำหรับการประเมิน!");
    
    try {
      const liff = (await import("@line/liff")).default;
      if (liff.isInClient()) {
        liff.closeWindow();
      } else {
        window.close(); // Browser fallback
      }
    } catch (error) {
      console.error("Failed to close LIFF window", error);
      window.close();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-[#304052]">
      {/* --- Header --- */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold pr-6">ให้คะแนนประเมิน</h1>
      </header>

      <div className="p-4 flex flex-col gap-4 flex-1 pb-24">
        <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-gray-50 shadow-sm">
            <Image 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" 
              alt="Volunteer" 
              fill 
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Titles */}
          <h2 className="text-[20px] font-extrabold text-gray-900 mb-1">ให้คะแนนอาสาสมัคร</h2>
          <p className="text-[#98A2B3] text-[13px] font-medium text-center mb-6">
            การช่วยเหลือเสร็จสิ้น ให้คะแนนคุณ <span className="font-bold text-gray-700">สมหญิง ใจดี</span>
          </p>

          {/* Stars */}
          <div className="flex gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform active:scale-90"
              >
                <Star
                  size={42}
                  className={`${
                    star <= rating
                      ? "fill-[#3b82f6] text-[#3b82f6]" // Blue star
                      : "fill-gray-100 text-gray-200" // Gray star
                  } transition-colors duration-200`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Additional Feedback Section (appears only after rating > 0) */}
        {rating > 0 && (
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Header */}
            <div className="w-full bg-gray-50/50 border-b border-gray-50 px-5 py-4 flex items-center gap-2">
              <Heart size={16} className="fill-[#304052] text-[#304052]" />
              <span className="font-extrabold text-gray-800 text-[14px]">ประทับใจเรื่องอะไรบ้าง?</span>
              <span className="text-[#98A2B3] text-[12px] font-medium ml-1">(เลือกได้มากกว่า 1)</span>
            </div>
            
            <div className="p-5">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {feedbackTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-colors ${
                        isSelected
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Textarea */}
              <div>
                <label className="text-[13px] font-bold text-gray-700 block mb-2">
                  รายละเอียดเพิ่มเติม
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="เพิ่มรายละเอียดเพิ่มเติม..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-blue-100 h-28 resize-none transition-shadow"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-10">
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className={`w-full py-4 rounded-2xl font-bold text-base shadow-lg transition-all ${
            rating > 0 
              ? "bg-[#304052] text-white shadow-gray-300 active:scale-[0.98]" 
              : "bg-gray-200 text-gray-400 shadow-none"
          }`}
        >
          ส่งคะแนนประเมิน
        </button>
      </div>
    </div>
  );
}
