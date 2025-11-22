import {prisma} from "@/lib/prisma";
import {NextRequest} from "next/server";

export async function GET(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams;
    let dep = searchParams.get("dep");
    let dest = searchParams.get("dest");

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

    if (dest.length === 4) {
        dest = dest.slice(1);
    }

    if (dep.length === 4) {
        dep = dep.slice(1);
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