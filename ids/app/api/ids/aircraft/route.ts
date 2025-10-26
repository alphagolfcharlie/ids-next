import {NextResponse} from "next/server";
import { Redis } from '@upstash/redis';

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
const CACHE_TTL_SECONDS = 60; // 1 min TTL

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


export async function GET() {
    try {

        const cached = await redis.get<Aircraft[]>("aircraft");

        if (cached) {
            // serve from cache
            return NextResponse.json({
                source: "cache", count:
                cached.length,
                aircraft: cached
            })
        }

        const lat = 41.21
        const lon = -82.94
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

        // update the cache

        await redis.set("aircraft", JSON.stringify(aircraft), { ex: CACHE_TTL_SECONDS})

        return NextResponse.json({
            source: "live",
            count: aircraft.length,
            pilots: aircraft
        });

    } catch (error: any) {
        console.error("Error fetching nearby pilots:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}