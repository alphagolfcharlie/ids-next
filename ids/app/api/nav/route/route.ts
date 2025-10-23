// endpoint for getting each fix and the lat lon of a route segment in its entirety.

import {prisma} from "@/lib/prisma";
import {NextRequest, NextResponse} from "next/server";
import {Decimal} from "@prisma/client/runtime/library";
import {decodeUriComponent} from "effect/Encoding";


function isAirway(segment: string): boolean {
    return /^[A-Z]\d+$/i.test(segment); // eg J70

}

function isProcedure(segment: string): boolean {
    return /\d$/.test(segment); // ends with a number
}


/**
 * Expands a SID into its list of fixes
 *
 * @param code The SID code in the format SID1.TRANS
 * @returns An array of fixes (strings)
 */

async function expandSID(code: string): Promise<string[]> {
    // eg HHOWE4.LNCON
    if (!code.includes(".")) {
        throw new Error(`Invalid SID code format: ${code}. Expected format "SID1.TRANS"`);
    }

    const sid = await prisma.sid.findFirst({
        where: {
            sid_code: code,
        }
    })

    if (!sid) {
        throw new Error(`SID not found for code ${code}`);
    }

    return sid.fixes
}

/**
 * Expands a STAR into its list of fixes
 * @param code The STAR code in the format TRANS.STAR1
 * @returns An array of fixes (string)
 */

async function expandSTAR(code: string): Promise<string[]> {
    // eg BOBTA.TPGUN2
    if (!code.includes(".")) {
        throw new Error(`Invalid STAR code format: ${code}. Expected format "TRANS.STAR1"`);
    }

    const star = await prisma.star.findFirst({
        where: {
            star_code: code,
        }
    })

    if (!star) {
        throw new Error(`STAR not found for code ${code}`);
    }

    return star.fixes
}

/**
 * Expands an airway from one point to another into a list of fixes
 * @param code The airway code (e.g. J70)
 * @param start The starting fix (inclusive)
 * @param end The ending fix (inclusive)
 * @returns An array of fixes (string)
 */

async function expandAirway(code: string, start: string, end: string): Promise<string[]> {
    const airway = await prisma.airway.findFirst({
        where: {
            awy_code: code,
        }
    })

    if (!airway) {
        throw new Error(`Airway '${code}' not found`);
    }

    let fixes = airway.fixes;

    // Apply start and end slicing if provided
    const startIndex = start ? fixes.indexOf(start) : 0;
    const endIndex = end ? fixes.indexOf(end) : fixes.length - 1;

    if (startIndex === -1) {
        throw new Error(`Start fix '${start}' not found in airway '${code}'`);
    }

    if (endIndex === -1) {
        throw new Error(`End fix '${end}' not found in airway '${code}'`);
    }

    // Handle direction (airways can be listed either direction)
    if (startIndex <= endIndex) {
        fixes = fixes.slice(startIndex, endIndex + 1);
    } else {
        fixes = fixes.slice(endIndex, startIndex + 1).reverse();
    }

    return fixes;
}

/**
 * Finds the latitude and longitude of one/more fixes/naviads
 * @param fixes array of fix/navaid identifiers (or one)
 * @returns array of {fix, lat, lon} objects
 */

async function getFixLatLon(
    fixes: string | string[]
): Promise<{ fix: string; lat: number; lon: number }[]> {
    const fixList = Array.isArray(fixes) ? fixes : [fixes];

    if (fixList.length === 0) throw new Error("No valid fixes provided");

    const results = await prisma.fix.findMany({
        where: { fix_id: { in: fixList } },
    });

    return results.map(f => ({
        fix: f.fix_id,
        lat: (f.lat instanceof Decimal ? f.lat.toNumber() : Number(f.lat)),
        lon: (f.lon instanceof Decimal ? f.lon.toNumber() : Number(f.lon)),
    }));
}


export async function GET(request: NextRequest) {

    try {

        const searchParams = request.nextUrl.searchParams;
        const routeParam = searchParams.get("route");


        // route not provided

        if (!routeParam) {
            return new Response(
                JSON.stringify({ error: "Missing required query parameter: 'route'"}),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            )
        }

        // route param provided

        const route = decodeURIComponent(routeParam).trim();
        const segments = route.split(/\s+/);

        let expandedFixes: string[] = [];

        let i = 0;

        // SID

        if (segments.length >= 2 && isProcedure(segments[0])) {
            const sidName = segments[0]
            const transition = segments[1]
            const sidFixes = await expandSID(`${sidName}.${transition}`);
            expandedFixes.push(...sidFixes); // spread operator - push fixes
            i = 2 // skip first 2 segments
        }


        // route body

        for (; i < segments.length; i++) {
            const current = segments[i];


            // stop if about to hit a star

            if (isProcedure(current) && i === segments.length - 1) {
                break;
            }

            if (isAirway(current) && i > 0 && i < segments.length - 1) {
                const airwayFixes = await expandAirway(current, segments[i-1], segments[i+1]);
                expandedFixes.pop(); // avoid duplicate start fix
                expandedFixes.push(...airwayFixes);
                i++ // skip the airway end fix
            } else {
                expandedFixes.push(current);
            }
        }


        // STAR

        if (segments.length >= 2 && isProcedure(segments[segments.length - 1])) {
            const starName = segments[segments.length - 1]
            const transition = segments[segments.length - 2]
            const starFixes = await expandSTAR(`${transition}.${starName}`);
            expandedFixes.push(...starFixes);
        }

        // convert to lat/lon

        // Batch fetch lat/lon
        const uniqueFixes = Array.from(new Set(expandedFixes));
        const allCoords = await getFixLatLon(uniqueFixes); // returns array

        // Map back to route order
        const fixesWithCoords = expandedFixes.map(fix => {
            const coords = allCoords.find(c => c.fix === fix);
            if (!coords) throw new Error(`Fix '${fix}' not found in database`);
            return coords;
        });

        return NextResponse.json({ route, fixes: fixesWithCoords });

    } catch (err: any) {
        console.error("Route expansion error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }

}