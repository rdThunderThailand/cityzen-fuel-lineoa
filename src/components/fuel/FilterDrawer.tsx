import { X } from "lucide-react";
import { Drawer } from "vaul";
import { FilterDrawerProps, FilterSectionProps } from "@/types/fuel";

export default function FilterDrawer({
  open,
  onOpenChange,
}: FilterDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-50 outline-none p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">ตัวกรอง</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="bg-gray-100 p-2 rounded-full"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-6">
            <FilterSection
              title="ประเภทเชื้อเพลิง"
              options={["ดีเซล", "เบนซิน", "แก๊สโซฮอล์", "EV"]}
            />
            <FilterSection
              title="สถานะปั๊ม"
              options={["มีบริการ", "มีบางชนิด", "ไม่มีบริการ"]}
              isStatus
            />

            <section>
              <h3 className="font-bold text-gray-800 mb-3">ระยะทาง</h3>
              <div className="grid grid-cols-3 gap-3">
                {["5 กม.", "10 กม.", "20 กม."].map((d) => (
                  <button
                    key={d}
                    className="py-3 rounded-xl border border-gray-200 text-sm hover:bg-blue-50 hover:border-blue-200 transition"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold mt-8 shadow-lg">
            บันทึกตัวกรอง
          </button>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}


function FilterSection({ title, options }: FilterSectionProps) {
  return (
    <section>
      <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt: string) => (
          <label
            key={opt}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer"
          >
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm font-medium">{opt}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
