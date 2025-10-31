import fs from 'fs';
import {PrismaClient} from '@prisma/client';
import {prisma} from "@/lib/prisma";


const filePath: string = 'data/jsons/fixes.json';

interface Fix {
    FIX_ID: string;
    LAT_DECIMAL: number;
    LONG_DECIMAL: number;
}

export async function loadFixes() {
    fs.readFile(filePath, 'utf8', async (err, jsonString: string) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const data: Fix[] = JSON.parse(jsonString);

        const sanitised = data.map(item => ({
            fix_id: item.FIX_ID,
            lat: item.LAT_DECIMAL,
            lon: item.LONG_DECIMAL,
        }));


        await prisma.fix.deleteMany();

        console.log("All fixes deleted!")

        const result = await prisma.fix.createMany({
            data: sanitised,
            skipDuplicates: true // avoid inserting dupes
        })
        console.log(`Inserted ${result.count} results`)

    });
}

