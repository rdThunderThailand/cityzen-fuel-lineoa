import { Station } from "@/types/fuel";
import { Search, ListChecks, MapPin, CheckCircle2 } from "lucide-react";

export function ScreenSelectStation({ stations, loading, selectedStation, onSelect, onOpenMap }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Card Header */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-100">
           <div className="bg-[#34445c] rounded p-1.5 flex items-center justify-center">
             <ListChecks size={16} className="text-white" />
           </div>
           <h3 className="text-[15px] font-bold text-gray-800">เลือกปั๊มที่ต้องการรายงาน</h3>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Location Box */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-blue-200 bg-[#f4f9ff]">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 rounded-full p-1 w-6 h-6 flex items-center justify-center">
                <MapPin size={12} className="text-white" />
              </div>
              <span className="text-sm text-blue-600">ใกล้คุณ: เทศบาลหนองปรือ</span>
            </div>
            <button className="text-sm text-blue-500 font-medium">เปลี่ยน</button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="ค้นหาอำเภอ/เทศบาล..." 
              className="w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 bg-white"
            />
          </div>

          {/* Stations List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {stations.map((s: Station) => {
                const isSelected = selectedStation?.id === s.id;
                
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelect(s)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition text-left ${isSelected ? 'border-blue-500 bg-blue-50/20' : 'border-gray-200 bg-white'}`}
                  >
                    {/* Image placeholder instead of text block */}
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img 
                        src={s.brand === "PTT" ? "https://cityzen-fuel-lineoa.vercel.app/ptt-station.jpg" : "https://mpics.mgronline.com/pics/Images/566000002821101.JPEG"} 
                        alt={s.brand} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="font-bold text-gray-900 truncate text-sm">{s.name}</p>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
                        <MapPin size={10} />
                        <span>ห่าง {(s.distance_meters / 1000).toFixed(1)} กม.</span>
                      </div>
                    </div>
                    
                    {/* Status badge */}
                    <div className="flex items-center gap-1 bg-[#e0f8e9] px-2.5 py-1 rounded-full shrink-0 mr-1">
                      <CheckCircle2 size={10} className="text-[#1ca34d] fill-current bg-white rounded-full" />
                      <span className="text-[10px] font-bold text-[#1ca34d]">มีบริการ</span>
                    </div>
                    
                    {/* Checkbox / Radio */}
                    <div className={`w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'border border-gray-300 bg-white'}`}>
                      {isSelected && <div className="w-[8px] h-[8px] bg-white rounded-[2px]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Other station / Map button */}
          <button onClick={onOpenMap} className="w-full py-4 mt-2 border-2 border-dashed border-blue-200 rounded-xl text-blue-500 font-medium text-sm flex items-center justify-center gap-2 bg-[#f8fbff]">
            <MapPin size={16} /> ค้นหาปั๊มอื่น / เลือกบนแผนที่
          </button>
        </div>
      </div>
    </div>
  );
}
