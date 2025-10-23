import fs from 'fs';
import {PrismaClient} from '@prisma/client';
import {prisma} from "@/lib/prisma";


const filePath: string = 'data/jsons/ids.awy.json';

interface Awy {
    AWY_ID: string;
    AIRWAY_STRING: string;
}

export async function loadAirways() {
    fs.readFile(filePath, 'utf8', async (err, jsonString: string) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const data: Awy[] = JSON.parse(jsonString);

        const sanitised = data.map(item => ({
            awy_code: item.AWY_ID,
            fixes: item.AIRWAY_STRING.split(' '),
        }));


        // await prisma.route.deleteMany();

        const result = await prisma.airway.createMany({
            data: sanitised,
            skipDuplicates: true // avoid inserting dupes
        })
        console.log(`Inserted ${result.count} results`)

    });
}


