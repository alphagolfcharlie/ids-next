// API route to expand a STAR into its fixes 

import {prisma} from "@/lib/prisma";
import {NextRequest} from "next/server";

export async function GET(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");


    // fix not provided

    if (!code) {
        return new Response(
            JSON.stringify({ error: "Missing required query parameter: 'code'"}),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        )
    }

    // code param provided


    const routes = await prisma.star.findFirst({
        where: {
            star_code: code,
        }
    })
    return new Response(JSON.stringify(routes), {
        status: 200,
        headers: {'Content-Type': 'application/json'}
    });

}