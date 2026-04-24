"use client";
import { ChevronLeft, Info, Check, Phone, MapPin, Truck, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Map, { Source, Layer, Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

export default function TrackingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"en_route" | "arriving">("en_route");
  const [mounted, setMounted] = useState(false);

  // For Mapbox
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [viewport, setViewport] = useState({
    latitude: 13.7563,
    longitude: 100.5018,
    zoom: 13,
  });
  const [incidentLocation, setIncidentLocation] = useState({
    latitude: 13.7563,
    longitude: 100.5018,
  });

  useEffect(() => {
    setMounted(true);

    // Retrieve saved location or use default
    const saved = sessionStorage.getItem("helpFormLocation");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setViewport({
          latitude: data.lat,
          longitude: data.lng,
          zoom: 13.5,
        });
        setIncidentLocation({
          latitude: data.lat,
          longitude: data.lng,
        });
      } catch (e) {}
    }

    // Toggle status for demonstration purposes
    const timer1 = setTimeout(() => {
      setStatus("arriving");
    }, 4000);

    const timer2 = setTimeout(() => {
      router.replace("/liff/request-help/rating");
    }, 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [router]);

  // Fake Route Data
  // Start: Volunteer Base (bottom right-ish)
  // End: Incident Location
  const destLng = incidentLocation.longitude;
  const destLat = incidentLocation.latitude;
  
  // Volunteer base offset
  const baseLng = destLng + 0.02;
  const baseLat = destLat - 0.015;

  // Midpoint for "en_route" truck position
  const midLng = destLng + 0.008;
  const midLat = destLat - 0.005;

  // Route path
  const routeGeojson: any = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [
        [baseLng, baseLat],
        [destLng + 0.015, destLat - 0.012],
        [destLng + 0.01, destLat - 0.008],
        [midLng, midLat],
        [destLng + 0.003, destLat - 0.001],
        [destLng, destLat],
      ]
    }
  };

  const isArriving = status === "arriving";
  
  // Theme colors
  const primaryColor = isArriving ? "#22c55e" : "#1e3a8a"; // green-500 or blue-900
  const lightBgColor = isArriving ? "bg-green-50" : "bg-blue-50";
  const lightBorderColor = isArriving ? "border-green-200" : "border-blue-200";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-[#304052]">
      {/* --- Header --- */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold pr-6">ตำแหน่งของคุณ</h1>
      </header>

      <div className="p-4 flex flex-col gap-4">
        
        {/* Map Card */}
        <div className="relative w-full h-80 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          {mounted && mapboxAccessToken ? (
            <Map
              {...viewport}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={mapboxAccessToken}
              style={{ width: "100%", height: "100%" }}
              onMove={(evt) => setViewport(evt.viewState)}
            >
              {/* Route Line */}
              <Source id="route" type="geojson" data={routeGeojson}>
                <Layer
                  id="route-line"
                  type="line"
                  layout={{
                    "line-join": "round",
                    "line-cap": "round",
                  }}
                  paint={{
                    "line-color": primaryColor,
                    "line-width": 6,
                  }}
                />
              </Source>

              {/* Base Location Marker (House) */}
              <Marker longitude={baseLng} latitude={baseLat} anchor="center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors duration-500"
                  style={{ backgroundColor: isArriving ? "#22c55e" : "#374151" }} // Green or Gray-800
                >
                  <Home size={20} color="white" />
                </div>
              </Marker>

              {/* Incident Location Marker (Red Pin) */}
              <Marker longitude={destLng} latitude={destLat} anchor="bottom">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md border-2 border-white relative z-10">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500 -mt-1 relative z-0"></div>
                </div>
              </Marker>

              {/* Volunteer Truck Marker */}
              <Marker 
                longitude={isArriving ? destLng : midLng} 
                latitude={isArriving ? destLat : midLat} 
                anchor="center"
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors duration-500 ${
                    isArriving ? 'bg-green-500' : 'bg-[#1e3a8a]'
                  }`}
                >
                  <Truck size={20} color="white" />
                </div>
              </Marker>
            </Map>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              กำลังโหลดแผนที่...
            </div>
          )}
        </div>

        {/* Status Info Box */}
        <div className={`rounded-2xl p-4 flex items-start gap-4 border transition-colors duration-500 ${lightBgColor} ${lightBorderColor}`}>
          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 transition-colors duration-500 ${isArriving ? 'bg-green-500' : 'bg-blue-500'}`}>
            {isArriving ? (
              <Check size={18} color="white" strokeWidth={3} />
            ) : (
              <Info size={18} color="white" />
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-[15px] mb-1">
              {isArriving ? "อาสาสมัครใกล้ถึงแล้ว" : "อาสาสมัครกำลังเดินทางไป"}
            </h3>
            <p className="text-gray-600 text-[14px] leading-relaxed">
              โปรดรอที่จุดเกิดเหตุ หรือโทรติดต่อหากมีการเปลี่ยนแปลง
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="w-full bg-gray-50/50 border-b border-gray-50 px-5 py-3 flex justify-start">
            <span className="font-extrabold text-gray-800 text-[15px]">#CZ-41725</span>
          </div>
          
          <div className="p-5 flex items-center gap-4">
            {/* Avatar */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-gray-50">
              <Image 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" 
                alt="Volunteer" 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <h2 className="text-[16px] font-extrabold text-gray-900 leading-tight">คุณ สมหญิง ใจดี</h2>
              <p className="text-[#98A2B3] text-[13px] font-medium mt-0.5">เจ้าหน้าที่ช่วยเหลืออาสาสมัคร</p>
              <div className="inline-block px-2.5 py-1 bg-red-50 text-red-500 text-[11px] font-bold rounded-full mt-2">
                รถฉุกเฉิน
              </div>
            </div>

            {/* Call Button */}
            <button className="w-12 h-12 bg-blue-50 hover:bg-blue-100 transition-colors rounded-2xl flex items-center justify-center shrink-0">
              <Phone size={22} className="text-[#1e3a8a] fill-[#1e3a8a]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
