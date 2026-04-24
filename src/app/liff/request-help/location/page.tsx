"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, MapPin, LocateFixed } from "lucide-react";
import { useRouter } from "next/navigation";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

export default function SelectLocationPage() {
  const router = useRouter();
  const [address, setAddress] = useState("ซอยบงกช 8, พัทยากลาง");
  const [landmark, setLandmark] = useState("");

  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState({
    latitude: 12.93,
    longitude: 100.89,
    zoom: 14,
  });

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    setMounted(true);
    
    // โหลดข้อมูลที่เคยเลือกไว้จาก sessionStorage
    const saved = sessionStorage.getItem("helpFormLocation");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setAddress(data.address);
        setLandmark(data.landmark);
        setViewport(v => ({ ...v, latitude: data.lat, longitude: data.lng }));
        return; // ไม่ต้องดึงพิกัดใหม่ถ้ามีข้อมูลเดิมแล้ว
      } catch (e) {
        console.error("Failed to parse saved location", e);
      }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setViewport((v) => ({
            ...v,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
        },
        (error) => {
          console.warn("Geolocation failed:", error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      );
    }
  }, []);

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setViewport((v) => ({
            ...v,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
        },
        (error) => {
          console.warn("Locate me failed:", error.message);
          alert("ไม่สามารถดึงตำแหน่งปัจจุบันได้ กรุณาเปิดการใช้งาน Location (GPS)");
        },
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#304052]">
      {/* --- Header --- */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-20">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-gray-400"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold">ตำแหน่งของคุณ</h1>
      </header>

      {/* --- ส่วนแผนที่ (Map Area) --- */}
      <div className="relative flex-1 bg-blue-50 min-h-[300px]">
        {/* Mapbox Map */}
        <div className="absolute inset-0">
          {mounted && (
            <Map
              {...viewport}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={mapboxAccessToken}
              style={{ width: "100%", height: "100%" }}
              onMove={(evt) => setViewport(evt.viewState)}
            />
          )}
        </div>

        {/* Marker & Tooltip (ปักหมุดกลางจอ) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-blue-600 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold shadow-lg mb-1 relative">
              ตำแหน่งคุณ
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45"></div>
            </div>
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-blue-600/50 -z-10 mt-2"></div>
            </div>
          </div>
        </div>

        {/* ปุ่ม Locate Me */}
        <button 
          onClick={handleLocateMe}
          className="absolute bottom-6 right-6 p-3 bg-white rounded-xl shadow-xl text-gray-600 active:scale-90 transition-transform z-10"
        >
          <LocateFixed size={24} />
        </button>
      </div>

      {/* --- ส่วนรายละเอียดสถานที่ (Details Card) --- */}
      <div className="bg-white px-6 pt-8 pb-4 rounded-t-[2.5rem] -mt-10 relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border-t border-gray-50">
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase">
            <MapPin size={16} fill="currentColor" className="text-[#304052]" />
            รายละเอียดสถานที่
          </div>

          <div className="space-y-4">
            {/* ฟิลด์ที่อยู่ */}
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">
                ที่อยู่ / ถนน / ซอย
              </label>
              <input
                type="text"
                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* ฟิลด์จุดสังเกต */}
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">
                จุดสังเกต
              </label>
              <textarea
                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 h-24 resize-none"
                placeholder="เช่น หน้าตึกสีส้ม, ตรงข้ามร้านสะดวกซื้อ, บ้านประตูเหล็กดัด..."
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ปุ่มกดยืนยัน */}
        <div className="mt-8 mb-4">
          <button
            onClick={() => {
              sessionStorage.setItem("helpFormLocation", JSON.stringify({
                address,
                landmark,
                lat: viewport.latitude,
                lng: viewport.longitude
              }));
              router.back();
            }}
            className="w-full py-4 bg-[#304052] text-white rounded-2xl font-bold text-base shadow-lg shadow-gray-200 active:scale-[0.98] transition-transform"
          >
            ตรวจสอบข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
}
