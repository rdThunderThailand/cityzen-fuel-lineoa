export type FuelStatus = "available" | "partial" | "limited" | "out_of_service";

export interface Station {
  id: string;
  name: string;
  brand: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_meters: number;
  status: FuelStatus; // Mapping จาก Logic หลังบ้าน
  queue_status?: string; // เพิ่ม queue_status สำหรับหน้า map
  updated_at: string;
  fuels: string[]; // เช่น ['ดีเซล', '95']
}
