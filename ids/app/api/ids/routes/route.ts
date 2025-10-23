import {prisma} from "@/lib/prisma";
import {NextRequest} from "next/server";

export async function GET(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams;
    const dep = searchParams.get("dep");
    const dest = searchParams.get("dest");

    // dep or dest not provided

    if (!dep || !dest) {
        return new Response(
            JSON.stringify({ error: "Missing required query parameter: 'dep' and/or 'dest'"}),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        )
    }

    // dep&dest parameter provided

    const routes = await prisma.route.findMany({
        where: {
            dep: dep,
            dest: dest,

        }
    })
    return new Response(JSON.stringify(routes), {
        status: 200,
        headers: {'Content-Type': 'application/json'}
    });
}