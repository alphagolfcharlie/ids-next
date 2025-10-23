// API route to return a fix's lat and lon (works for multiple fixes)

import {prisma} from "@/lib/prisma";
import {NextRequest} from "next/server";

export async function GET(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams;
    const fixesParam = searchParams.get("fixes");


    // fix not provided

    if (!fixesParam) {
        return new Response(
            JSON.stringify({ error: "Missing required query parameter: 'fixes'"}),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        )
    }

    // fix param provided

    const fixes = fixesParam.split(",").map(f => f.trim()).filter(Boolean);

    if (fixes.length === 0) {
        return new Response(
            JSON.stringify({ error: "No valid fixes provided" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    const routes = await prisma.fix.findMany({
        where: {
            fix_id: {
                in: fixes,
            },
        }
    })
    return new Response(JSON.stringify(routes), {
        status: 200,
        headers: {'Content-Type': 'application/json'}
    });


}