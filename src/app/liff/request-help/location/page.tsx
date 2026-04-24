"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, MapPin, LocateFixed } from "lucide-react";
import { useRouter } from "next/navigation";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

export default function SelectLocationPage() {
  const router = useRouter();
  const [address, setAddress] = useState("ซอยบงกช 8, พัทยากลาง");
  const [subLocation, setSubLocation] = useState("พัทยา, ชลบุรี");
  const [landmark, setLandmark] = useState("");

  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState({
    latitude: 12.93,
    longitude: 100.89,
    zoom: 14,
  });

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const fetchAddress = async (lat: number, lng: number) => {
    if (!mapboxAccessToken) return;
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxAccessToken}&language=th`,
      );
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];

        // แยกเอาที่อยู่หลัก (ตัดส่วนอำเภอ, จังหวัด, รหัสไปรษณีย์, ประเทศออก)
        const placeNameParts = feature.place_name
          .split(",")
          .map((p: string) => p.trim());

        // ดึงอำเภอ (locality/district), จังหวัด (place/region) และ ประเทศ (country)
        const context = feature.context || [];

        let district = "";
        let province = "";

        // 1. หาจาก string parts ก่อน เพราะแม่นยำกว่าในแง่ของคำนำหน้าสำหรับประเทศไทย
        placeNameParts.forEach((part: string) => {
          if (part.startsWith("จังหวัด") || part === "กรุงเทพมหานคร") {
            province = part;
          } else if (part.startsWith("อำเภอ") || part.startsWith("เขต")) {
            district = part;
          }
        });

        // 2. ถ้าหาไม่เจอ ค่อยไปพึ่ง context จาก Mapbox
        if (!district) {
          const districtObj = context.find(
            (c: any) =>
              c.id.startsWith("locality") || c.id.startsWith("district"),
          );
          if (districtObj) district = districtObj.text;
        }
        if (!province) {
          const provinceObj = context.find(
            (c: any) => c.id.startsWith("place") || c.id.startsWith("region"),
          );
          if (provinceObj) province = provinceObj.text;
        }

        const countryObj = context.find((c: any) => c.id.startsWith("country"));
        const country = countryObj ? countryObj.text : "ประเทศไทย";

        // ป้องกันกรณีที่ Mapbox ให้ district กับ province ซ้ำกัน
        const subLocParts = [];
        if (district) subLocParts.push(district);
        if (province && province !== district) subLocParts.push(province);
        const subLoc = subLocParts.join(", ");

        // กรองเอาเฉพาะส่วนที่ไม่ใช่ อำเภอ จังหวัด และประเทศ เพื่อมาเป็นที่อยู่หลัก (จะทำให้ตำบลหรือถนนยังคงอยู่)
        const mainAddressParts = placeNameParts.filter((part: string) => {
          if (district && part.includes(district)) return false;
          if (province && part.includes(province)) return false;
          if (country && part.includes(country)) return false;
          if (part === "ประเทศไทย" || part === "Thailand") return false;
          return true;
        });

        let mainAddress = mainAddressParts.join(", ");
        // Fallback ถ้ากรองแล้วหายหมด
        if (!mainAddress) {
          mainAddress = feature.text || placeNameParts[0];
        }

        setAddress(mainAddress);
        setSubLocation(subLoc || "ไม่ระบุ");
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    }
  };

  useEffect(() => {
    setMounted(true);

    // โหลดข้อมูลที่เคยเลือกไว้จาก sessionStorage
    const saved = sessionStorage.getItem("helpFormLocation");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setAddress(data.address);
        if (data.subLocation) setSubLocation(data.subLocation);
        setLandmark(data.landmark);
        setViewport((v) => ({ ...v, latitude: data.lat, longitude: data.lng }));
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
          fetchAddress(pos.coords.latitude, pos.coords.longitude);
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
          fetchAddress(pos.coords.latitude, pos.coords.longitude);
        },
        (error) => {
          console.warn("Locate me failed:", error.message);
          alert(
            "ไม่สามารถดึงตำแหน่งปัจจุบันได้ กรุณาเปิดการใช้งาน Location (GPS)",
          );
        },
        { enableHighAccuracy: true },
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
              onMoveEnd={(evt) =>
                fetchAddress(evt.viewState.latitude, evt.viewState.longitude)
              }
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
              sessionStorage.setItem(
                "helpFormLocation",
                JSON.stringify({
                  address,
                  subLocation,
                  landmark,
                  lat: viewport.latitude,
                  lng: viewport.longitude,
                }),
              );
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
