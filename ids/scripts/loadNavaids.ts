import fs from 'fs';
import {prisma} from "@/lib/prisma";


const filePath: string = 'data/jsons/ids.nav.json';

interface Nav {
    NAV_ID: string;
    LAT_DECIMAL: number;
    LONG_DECIMAL: number;
    NAME: string;
}

export async function loadNavaids() {
    fs.readFile(filePath, 'utf8', async (err, jsonString: string) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const data: Nav[] = JSON.parse(jsonString);

        const sanitised = data.map(item => ({
            fix_id: item.NAV_ID,
            lat: item.LAT_DECIMAL,
            lon: item.LONG_DECIMAL,
            nav_name: item.NAME,
        }));


        // await prisma.route.deleteMany();

        const result = await prisma.fix.createMany({
            data: sanitised,
            skipDuplicates: true // avoid inserting dupes
        })
        console.log(`Inserted ${result.count} results`)

    });
}

