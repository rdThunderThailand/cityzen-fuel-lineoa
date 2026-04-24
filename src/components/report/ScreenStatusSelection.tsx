import { ArrowRight, Check } from "lucide-react";

export function ScreenStatusSelection({ data, setData, onNext }: any) {
  const statuses = [
    {
      id: "available",
      label: "มีบริการ",
      color: "bg-green-50 text-green-700 border-green-200",
      dot: "bg-green-500",
    },
    {
      id: "partial",
      label: "มีบางชนิด",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      dot: "bg-yellow-500",
    },
    {
      id: "busy",
      label: "จำกัด / คิวยาว",
      color: "bg-orange-50 text-orange-700 border-orange-200",
      dot: "bg-orange-500",
    },
    {
      id: "closed",
      label: "ไม่มีชั่วคราว",
      color: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      <section>
        <h3 className="font-bold text-gray-800 text-lg mb-4">เลือกสถานะ</h3>
        <div className="grid grid-cols-1 gap-3">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => setData({ ...data, status: s.id })}
              className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                data.status === s.id
                  ? s.color
                  : "bg-white border-gray-100 text-gray-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${data.status === s.id ? s.dot : "bg-gray-200"}`}
                />
                <span className="font-bold">{s.label}</span>
              </div>
              {data.status === s.id && <Check size={20} />}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 text-lg mb-4">
          เชื้อเพลิงที่เกี่ยวข้อง
        </h3>
        <div className="flex flex-wrap gap-2">
          {["ดีเซล", "เบนซิน 95", "แก๊สโซฮอล์ 91", "E20", "EV"].map((f) => (
            <button
              key={f}
              onClick={() => {
                const fuels = data.fuels.includes(f)
                  ? data.fuels.filter((i: any) => i !== f)
                  : [...data.fuels, f];
                setData({ ...data, fuels });
              }}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                data.fuels.includes(f)
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <button
        disabled={!data.status}
        onClick={onNext}
        className="w-full py-4 bg-black text-white rounded-2xl font-bold disabled:bg-gray-200 disabled:text-gray-400 shadow-xl transition-all flex items-center justify-center gap-2"
      >
        ถัดไป <ArrowRight size={20} />
      </button>
    </div>
  );
}
