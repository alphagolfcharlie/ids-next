import {NextRequest} from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams;
    let field = searchParams.get("field"); // eg /api/crossings?field=DTW

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

    if (field.length === 4) {
        field = field.substring(1);
    }

    const crossings = await prisma.crossing.findMany({
        where: {
            field: field
        }
    })
    return new Response(JSON.stringify(crossings), {
        status: 200,
        headers: {'Content-Type': 'application/json'}
    });

}