// src/app/api/stations/route.ts
import { Station } from "@/types/fuel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const baseUrl = process.env.THUNDER_CORE_BASE_URL;
  const apiKey = process.env.THUNDER_CORE_API_KEY;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "THUNDER_CORE_BASE_URL is not configured" },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(`${baseUrl}/api/fuel/stations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || "",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Thunder Core API Error: ${response.status}` },
        { status: response.status },
      );
    }

    const json = await response.json();
    const stations = json.data || [];

    // Sort by distance if lat/lng provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      const sorted = stations
        .map((s: Station) => ({
          ...s,
          distance_meters: calculateDistance(
            userLat,
            userLng,
            s.latitude,
            s.longitude,
          ),
        }))
        .sort(
          (a: Station, b: Station) =>
            (a.distance_meters || 0) - (b.distance_meters || 0),
        );

      return NextResponse.json({ data: sorted });
    }

    return NextResponse.json({ data: stations });
  } catch (error) {
    console.error("Failed to fetch from Thunder Core:", error);
    return NextResponse.json(
      { error: "Failed to fetch stations" },
      { status: 500 },
    );
  }
}

// Haversine Formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
