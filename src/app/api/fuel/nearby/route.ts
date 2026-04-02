// src/app/api/fuel/nearby/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchNearbyStations } from "@/services/thunder-core";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 },
    );
  }

  const stations = await fetchNearbyStations(lat, lng);
  return NextResponse.json({ stations });
}
