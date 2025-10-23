import fs from 'fs';
import {PrismaClient, route_source_choices} from '@prisma/client';
import {prisma} from "@/lib/prisma";


const filePath: string = 'data/jsons/ids.faa.json';

interface FaaRoute {
    Orig: string;
    RouteString: string;
    Dest: string;
    Aircraft: string | null;
    Direction: string | null;
}

export async function loadFaaRoutes() {
    fs.readFile(filePath, 'utf8', async (err, jsonString: string) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const data: FaaRoute[] = JSON.parse(jsonString);

        const sanitised = data.map(item => ({
            dep: item.Orig,
            dest: item.Dest,
            route: item.RouteString,
            altitude: null,
            notes: [item.Aircraft, item.Direction].filter(Boolean).join(" "), // filter boolean removes null and empty
            source: 'faa' as route_source_choices,
        }));


        // await prisma.route.deleteMany();

        const result = await prisma.route.createMany({
            data: sanitised,
            skipDuplicates: true // avoid inserting dupes
        })
        console.log(`Inserted ${result.count} results`)

    });

}
