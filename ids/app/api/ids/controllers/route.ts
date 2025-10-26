import { NextResponse } from "next/server";
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

type Controller = {
    region: string;
    artccId: string;
    callsign: string;
    frequencyMHz: number | null;
    controllerName: string;
    cid: string;
    rating: string;
    loginTime: string;
}


const VNAS_CONTROLLERS_URL = "https://live.env.vnas.vatsim.net/data-feed/controllers.json";
const VATSIM_API_URL = "https://data.vatsim.net/v3/vatsim-data.json";


const CACHE_TTL_SECONDS = 60; // TTL of 1 minute


const CALLSIGN_TO_ARTCC: Record<string, string> = { // for Canada
    TOR: "CZYZ",
    WPG: "CZWG",
    CZVR: "CZVR",
    MTL: "CZUL",
    CZQM: "CZQM",
    CZQX: "CZQM",
    CZEG: "CZEG",
};

const CANADA_REGEX = /^([A-Z]{3,4})_(?:\d{1,3}_)?(?:CTR|FSS)$/i;

export async function GET() {
    try {

        const cached = await redis.get<Controller[]>("controllers");

        if (cached) {
            //serve from cache
            return NextResponse.json({ source: "cache", count: cached.length, enroute: cached });
        }

        // --- Fetch both sources in parallel ---
        const [vnasRes, vatsimRes] = await Promise.all([
            fetch(VNAS_CONTROLLERS_URL, { cache: "no-store" }),
            fetch(VATSIM_API_URL, { cache: "no-store" }),
        ]);

        if (!vnasRes.ok || !vatsimRes.ok) {
            throw new Error("Failed to fetch one or more controller sources");
        }

        const [vnasData, vatsimData] = await Promise.all([vnasRes.json(), vatsimRes.json()]);

        // --- VNAS: US Center controllers ---
        const centerControllers = (vnasData.controllers || [])
            .filter(
                (c: any) =>
                    c.isActive &&
                    !c.isObserver &&
                    c.vatsimData?.facilityType === "Center"
            )
            .flatMap((controller: any) =>
                controller.positions
                    .filter((pos: any) => pos.isPrimary && pos.isActive)
                    .map(() => ({
                        region: "US",
                        artccId: controller.artccId,
                        callsign: controller.vatsimData?.callsign,
                        frequencyMHz: controller.vatsimData?.primaryFrequency
                            ? controller.vatsimData.primaryFrequency / 1_000_000
                            : null,
                        controllerName: controller.vatsimData?.realName || "Unknown",
                        cid: controller.vatsimData?.cid,
                        rating: controller.vatsimData?.userRating,
                        loginTime: controller.loginTime,
                    }))
            );

        // ZOB TRACONs (filtered out for now)

        {/*const traconControllers = (vnasData.controllers || [])
            .filter(
                (c: any) =>
                    c.isActive &&
                    !c.isObserver &&
                    c.vatsimData?.facilityType === "ApproachDeparture" &&
                    c.artccId === "ZOB"
            )
            .flatMap((controller: any) =>
                controller.positions
                    .filter((pos: any) => pos.isPrimary && pos.isActive)
                    .map((pos: any) => ({
                        region: "US",
                        artccId: controller.artccId,
                        callsign: controller.vatsimData?.callsign,
                        frequencyMHz: controller.vatsimData?.primaryFrequency
                            ? controller.vatsimData.primaryFrequency / 1_000_000
                            : null,
                        controllerName: controller.vatsimData?.realName || "Unknown",
                        cid: controller.vatsimData?.cid,
                        rating: controller.vatsimData?.userRating,
                        loginTime: controller.loginTime,
                    }))
            );
            */}

        // Canadian Enroute

        const canadianControllers = (vatsimData.controllers || [])
            .filter((controller: any) => {
                const callsign = controller.callsign?.toUpperCase() || "";
                const match = callsign.match(CANADA_REGEX);
                if (!match) return false;

                const prefix = match[1];
                if (!CALLSIGN_TO_ARTCC[prefix]) return false;

                controller.artccId = CALLSIGN_TO_ARTCC[prefix];
                return true;
            })
            .map((controller: any) => ({
                region: "Canada",
                artccId: controller.artccId,
                callsign: controller.callsign,
                frequencyMHz: controller.frequency ? parseFloat(controller.frequency) : null,
                controllerName: controller.name,
                cid: controller.cid,
                rating: controller.rating,
                loginTime: controller.logon_time,
            }));

        // --- Merge all sources ---
        const combined = [...centerControllers, ...canadianControllers];

        // --- Cache results ---

        await redis.set("controllers", JSON.stringify(combined), { ex: CACHE_TTL_SECONDS });

        return NextResponse.json({
            source: "live",
            count: combined.length,
            enroute: combined,
        });

    } catch (error: any) {
        console.error("Error fetching controller data:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}