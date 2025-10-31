import fs from 'fs';
import {prisma} from "@/lib/prisma";

const filePath: string = 'data/jsons/apt.json';

interface Airport {
    ARPT_ID: string;
    LAT_DECIMAL: number;
    LONG_DECIMAL: number;
}

export async function loadAirports() {
    fs.readFile(filePath, 'utf8', async (err, jsonString: string) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const data: Airport[] = JSON.parse(jsonString);

        const sanitised = data.map(item => ({
            code: item.ARPT_ID,
            lat: item.LAT_DECIMAL,
            lon: item.LONG_DECIMAL,
        }));

        await prisma.airport.deleteMany();

        console.log("All airports deleted!")

        const result = await prisma.airport.createMany({
            data: sanitised,
            skipDuplicates: true // avoid inserting dupes
        })
        console.log(`Inserted ${result.count} results`)

    });
}
