"use client";
import {
  Ambulance,
  Car,
  ChevronLeft,
  Droplets,
  Fuel,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";

const categories = [
  {
    id: "fuel",
    name: "น้ำมัน",
    icon: <Fuel className="text-orange-500" size={40} />,
    color: "border-orange-500 text-orange-600 bg-white",
  },
  {
    id: "water",
    name: "น้ำดื่ม",
    icon: <Droplets className="text-blue-500" size={40} />,
    color: "border-blue-500 text-blue-600 bg-white",
  },
  {
    id: "food",
    name: "อาหาร",
    icon: <Utensils className="text-green-500" size={40} />,
    color: "border-green-500 text-green-600 bg-white",
  },
  {
    id: "medical",
    name: "การแพทย์",
    icon: <Ambulance className="text-red-500" size={40} />,
    color: "border-red-500 text-red-600 bg-white",
  },
  {
    id: "electricity",
    name: "ไฟฟ้า",
    icon: <Zap className="text-yellow-500" size={40} />,
    color: "border-yellow-500 text-yellow-600 bg-white",
  },
  {
    id: "travel",
    name: "การเดินทาง",
    icon: <Car className="text-indigo-500" size={40} />,
    color: "border-indigo-500 text-indigo-600 bg-white",
  },
  {
    id: "others",
    name: "อื่นๆ",
    icon: (
      <div className="bg-gray-400 text-white p-2 rounded-lg font-black text-sm">
        SOS
      </div>
    ),
    color: "border-gray-100 text-gray-800 bg-white",
    span: true,
  },
];

export default function HelpCategoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center sticky top-0 z-10 text-[#304052]">
        <Link href="/liff" className="p-2">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="flex-1 text-center font-bold">ขอความช่วยเหลือ</h1>
        <Link href="/liff" className="p-2">
          <X size={24} />
        </Link>
      </header>

      <div className="flex-1 bg-white mx-3 my-4 rounded-[2rem] p-6 shadow-sm">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">❤️</div>
          <h2 className="text-3xl font-black text-gray-900">ขอความช่วยเหลือ</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            เราจะช่วยส่งคำขอของคุณไปยังคนที่ช่วยได้ใกล้คุณ
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-5 mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/liff/request-help/form?type=${cat.id}`}
              className={`${cat.color} ${cat.span ? "col-span-2" : ""} border-4 p-8 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg`}
            >
              {cat.icon}
              <span className="font-bold text-xl">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Emergency Button */}
      <div className="p-4 mt-auto">
        <Link href="/liff/request-help/emergency">
          <button className="w-full bg-red-600 text-white rounded-full py-5 font-black text-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Ambulance size={28} />
            เหตุฉุกเฉินด่วน
          </button>
        </Link>
      </div>
    </div>
  );
}
