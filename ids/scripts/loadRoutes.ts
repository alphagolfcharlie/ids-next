import fs from 'fs';
import {PrismaClient, route_source_choices} from '@prisma/client';
import {prisma} from "@/lib/prisma";


const filePath: string = 'data/jsons/static/ids.routes.json';

interface RouteData {
    origin: string;
    destination: string;
    route: string;
    altitude: string | null;
    notes: string | null;
}

export async function loadRoutes() {
    fs.readFile(filePath, 'utf8', async (err, jsonString: string) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const data: RouteData[] = JSON.parse(jsonString);

        const sanitised = data.map(item => ({
            dep: item.origin,
            dest: item.destination,
            route: item.route,
            altitude: item.altitude,
            notes: item.notes,
            source: 'custom' as route_source_choices,
        }));


        console.log(sanitised);

        await prisma.route.deleteMany();

        const result = await prisma.route.createMany({
            data: sanitised,
            skipDuplicates: true // avoid inserting dupes
        })
        console.log(`Inserted ${result.count} results`)

    });

}

