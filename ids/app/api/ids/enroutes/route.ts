import {prisma} from "@/lib/prisma";
import {NextRequest} from "next/server";

export async function GET(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams;
    const field = searchParams.get("field");
    const areaParam = searchParams.get("area");
    const area = areaParam ? Number(areaParam) : undefined;

    // field paramter not provided

    if (!field) {
        return new Response(
            JSON.stringify({ error: "Missing required query parameter: 'field'"}),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        )
    }

    // field parameter provided

    const enroutes = await prisma.enroute.findMany({
        where: {
            fields: {has: field},
            ...(area ? {areas: {has: area}} : {}),
        }
    })
    return new Response(JSON.stringify(enroutes), {
        status: 200,
        headers: {'Content-Type': 'application/json'}
    });

}