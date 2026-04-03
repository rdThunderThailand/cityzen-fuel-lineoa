import { Check } from "lucide-react";

export function ScreenSuccess() {
  const closeLiff = () => {
    // @ts-ignore
    if (window.liff) window.liff.closeWindow();
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-100">
        <Check size={48} strokeWidth={3} />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-gray-900">รับรายงานแล้ว!</h2>
        <p className="text-gray-500 px-10">
          ขอบคุณที่ช่วยอัปเดตข้อมูลให้คนในพื้นที่ ข้อมูลของคุณมีค่ามากครับ 🙏
        </p>
      </div>

      <div className="w-full pt-8 space-y-3">
        <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">
          ดูสถานการณ์ใกล้ฉัน
        </button>
        <button
          onClick={closeLiff}
          className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold"
        >
          กลับไป LINE
        </button>
      </div>
    </div>
  );
}
