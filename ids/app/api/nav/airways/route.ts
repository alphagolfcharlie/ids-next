// api route to expand an airway into fixes


import {NextRequest} from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(request: NextRequest) {

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code"); // eg /api/airways?code=J70
    const start = searchParams.get("start"); // first fix
    const end = searchParams.get("end"); // last fix

    // code paramter not provided

    if (!code) {
        return new Response(
            JSON.stringify({ error: "Missing required query parameter: 'code'"}),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        )
    }

    // field parameter provided

    const airway = await prisma.airway.findFirst({
        where: {
            awy_code: code,
        }
    })

    if (!airway) {
        return new Response(
            JSON.stringify({ error: `Airway with code '${code}' not found` }),
            { status: 404, headers: { "Content-Type": "application/json" } }
        );
    }

    let fixes = airway.fixes;

    // apply start and end slicing if provided
    if (start || end) {
        const startIndex = start ? fixes.indexOf(start) : 0;
        const endIndex = end ? fixes.indexOf(end) : fixes.length - 1;

        if (startIndex === -1 && start) {
            return new Response(
                JSON.stringify({ error: `Start fix '${start}' not found` }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (endIndex === -1 && end) {
            return new Response(
                JSON.stringify({ error: `End fix '${end}' not found` }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (startIndex <= endIndex) {
            fixes = fixes.slice(startIndex, endIndex + 1);
        } else {
            fixes = fixes.slice(endIndex, startIndex + 1).reverse();
        }
    }

    return new Response(JSON.stringify({ ...airway, fixes }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}