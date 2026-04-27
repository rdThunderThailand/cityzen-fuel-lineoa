export type FuelStatus = "available" | "partial" | "limited" | "out_of_service";

export interface StationFuelStatus {
  updated_at: string;
  [key: string]: unknown;
}

export interface Station {
  id: string;
  name: string;
  brand: string;
  province?: string;
  district?: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_meters: number;
  status: FuelStatus; // Mapping จาก Logic หลังบ้าน
  queue_status?: string; // เพิ่ม queue_status สำหรับหน้า map
  updated_at: string;
  fuels: string[]; // เช่น ['ดีเซล', '95']
  fuel_station: string;
  fuel_status?: StationFuelStatus[]; // Added to match data returned by API and used in webhook
}

export interface FilterState {
  fuels: string[];
  statuses: string[];
  distance: number;
}

export interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

export interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface FilterSectionProps {
  title: string;
  options: string[];
  isStatus?: boolean;
}

export interface StationCardProps {
  station: Station;
  onDetail?: () => void;
  onReport?: () => void;
}

export interface StationDrawerProps {
  station: Station | null;
  mode?: "detail" | "report";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface StationListSheetProps {
  stations: Station[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectStation: (station: Station) => void;
}
