import {NextResponse} from "next/server";
import { Redis } from '@upstash/redis';
import artccMapViews from "@/data/jsons/static/artccMapViews.json"

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

type Aircraft = {
    callsign: string
    latitude: number
    longitude: number
    altitude: number
    groundspeed: number
    heading: number
    transponder: number
    route: string
    departure: string
    arrival: string
}


const VATSIM_API_URL = "https://data.vatsim.net/v3/vatsim-data.json"
const CACHE_TTL_SECONDS = 60; // 1 min TTL (5s for testing)

// return distance in nmi

/**
 * Calculate the great circle distance between two points on the earth's surface. Params all in radians.
 * @param lat1 - lat of point 1
 * @param lon1 - lon of point 1
 * @param lat2 - lat of point 2
 * @param lon2 - lon of point 2
 * @returns distance in nautical miles (integer)
 */


function distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180; // convert degrees to radians
    const R = 3440.065 // radius of the earth in nmi
    const dLat = toRad(lat2 - lat1); // delta lat
    const dLon = toRad(lon2 - lon1); // delta lon
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2; // use the haversine formula
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // atan2: quadrant-aware version of atan
    return R * c;
}


// Get ARTCC with multiple fallbacks
function getArtcc(): string {
    const artcc = process.env.ARTCC ||
        process.env.NEXT_PUBLIC_ARTCC ||
        'ZME'; // Default fallback
    return artcc.toUpperCase();
}


export async function GET() {
    try {
        const artcc = getArtcc();
        const cacheKey = `aircraft_${artcc}`;

        // Check cache with ARTCC-specific key
        const cached = await redis.get<Aircraft[]>(cacheKey);

        if (cached) {
            console.log(`[AIRCRAFT] Serving from cache for ${artcc}`);
            return NextResponse.json({
                source: "cache",
                count: cached.length,
                aircraft: cached,
                artcc: artcc
            })
        }

        console.log(`[AIRCRAFT] Cache miss for ${artcc}, fetching live data`);

        const fallback: [number, number] = [41.21, -82.94];
        const center = artccMapViews[artcc as keyof typeof artccMapViews]?.center ?? fallback;

        console.log(`[AIRCRAFT] Using ARTCC: ${artcc}`);
        console.log(`[AIRCRAFT] Center coordinates: ${center}`);
        console.log(`[AIRCRAFT] Available ARTCCs: ${Object.keys(artccMapViews).join(', ')}`);

        const lat = center[0]
        const lon = center[1]
        const distanceNM = 500

        // Fetch data from VATSIM
        const res = await fetch(VATSIM_API_URL);
        if (!res.ok) throw new Error("Failed to fetch VATSIM data");
        const data = await res.json();

        // Filter pilots within the requested distance
        const aircraft = data.pilots
            .filter((pilot: any) => {
                if (typeof pilot.latitude !== "number" || typeof pilot.longitude !== "number") return false;
                const dist = distance(lat, lon, pilot.latitude, pilot.longitude);
                return dist <= distanceNM;
            })
            .map((pilot: any) => ({
                callsign: pilot.callsign,
                latitude: pilot.latitude,
                longitude: pilot.longitude,
                altitude: pilot.altitude,
                groundspeed: pilot.groundspeed,
                heading: pilot.heading,
                transponder: pilot.transponder,
                route: pilot.flight_plan?.route || null,
                departure: pilot.flight_plan?.departure || null,
                arrival: pilot.flight_plan?.arrival || null,
            }));

        // Update the cache with ARTCC-specific key
        await redis.set(cacheKey, aircraft, { ex: CACHE_TTL_SECONDS});

        console.log(`[AIRCRAFT] Cached ${aircraft.length} aircraft for ${artcc}`);

        return NextResponse.json({
            source: "live",
            count: aircraft.length,
            aircraft: aircraft,
            artcc: artcc
        });

    } catch (error: any) {
        console.error("Error fetching nearby pilots:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
