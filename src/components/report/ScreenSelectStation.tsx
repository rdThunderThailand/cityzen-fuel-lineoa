import { Station } from "@/types/fuel";
import { MapPin, Search } from "lucide-react";

export function ScreenSelectStation({ stations, loading, onSelect }: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase">
              ใกล้คุณตอนนี้
            </p>
            <p className="text-sm font-bold text-blue-900">เทศบาลหนองปรือ</p>
          </div>
        </div>
        <button className="text-xs font-bold text-blue-600">เปลี่ยน</button>
      </div>

      <section>
        <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">
          เลือกปั๊มที่ต้องการรายงาน
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {stations.map((s: Station) => (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition text-left"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-blue-600 text-xs border border-gray-100">
                  {s.brand?.substring(0, 3)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400">
                    ห่างจากคุณ {(s.distance_meters / 1000).toFixed(1)} กม.
                  </p>
                </div>
              </button>
            ))}
            <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-sm flex items-center justify-center gap-2">
              <Search size={18} /> ค้นหาปั๊มอื่น / เลือกบนแผนที่
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
