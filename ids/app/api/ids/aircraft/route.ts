import {NextResponse} from "next/server";

const VATSIM_API_URL = "https://data.vatsim.net/v3/vatsim-data.json"
const CACHE_TTL_MS = 60 * 1000; // 1 min TTL

// return distance in nmi

function distToNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 3440.065 // radius of the earth in nmi
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2; // use the haversine formula to account for curvature of the earth
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// cache

let cachedData: any = null;
let lastFetchTime = 0;

export async function GET() {
    try {

        const now = Date.now();
        const isCacheValid = cachedData && now - lastFetchTime < CACHE_TTL_MS;

        if (isCacheValid) {
            // serve from cache
            return NextResponse.json({
                source: "cache",
                count: cachedData.length,
                pilots: cachedData,
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
        const nearbyPilots = data.pilots
            .filter((pilot: any) => {
                if (typeof pilot.latitude !== "number" || typeof pilot.longitude !== "number") return false;
                const dist = distToNm(lat, lon, pilot.latitude, pilot.longitude);
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

        cachedData = nearbyPilots;
        lastFetchTime = now;

        return NextResponse.json({
            source: "live",
            count: nearbyPilots.length,
            pilots: nearbyPilots
        });
    } catch (error: any) {
        console.error("Error fetching nearby pilots:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}