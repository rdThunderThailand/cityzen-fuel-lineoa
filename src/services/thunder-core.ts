// services/thunder-core.ts

import { Station } from "@/types/fuel";

export async function fetchNearbyStations(
  lat: number,
  lng: number,
): Promise<Station[]> {
  try {
    if (typeof window !== "undefined") {
      // Client-side: Call our own API route
      const response = await fetch(`/api/stations?lat=${lat}&lng=${lng}`);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const json = await response.json();
      return json.data || [];
    } else {
      // Server-side (e.g. Webhook): Call Thunder Core directly
      const baseUrl = process.env.THUNDER_CORE_BASE_URL;
      const apiKey = process.env.THUNDER_CORE_API_KEY;

      if (!baseUrl) {
        console.error(
          "❌ Error: THUNDER_CORE_BASE_URL is not defined in environment variables.",
        );
        return [];
      }

      const url = `${baseUrl}/api/fuel/stations`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey || "",
        },
      });

      if (!response.ok) {
        throw new Error(`Thunder Core API Error: ${response.status}`);
      }

      const json = await response.json();
      const stations = json.data || [];

      const sortedStations = stations
        .map((s: Station) => {
          const distance = calculateDistance(lat, lng, s.latitude, s.longitude);
          return { ...s, distance_meters: distance };
        })
        .sort(
          (a: Station, b: Station) =>
            (a.distance_meters || 0) - (b.distance_meters || 0),
        );

      return sortedStations;
    }
  } catch (error) {
    console.error("Failed to fetch stations:", error);
    return [];
  }
}

// Helper: Haversine Formula for server-side sorting
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371e3; // Earth radius in meters
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
