import fs from 'fs';
import {PrismaClient} from '@prisma/client';
import {prisma} from "@/lib/prisma";


const filePath: string = 'data/jsons/star.json';

interface Star {
    star_name: string;
    served_arpt: string;
    fixes: string;
}

export async function loadStars() {
    fs.readFile(filePath, 'utf8', async (err, jsonString: string) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const data: Star[] = JSON.parse(jsonString);

        const sanitised = data.map(item => ({
            star_code: item.star_name,
            apts: item.served_arpt.split(' '),
            fixes: item.fixes.split(' '),
        }));


        await prisma.star.deleteMany(); // delete all existing STARs

        console.log("All stars deleted!")

        const result = await prisma.star.createMany({
            data: sanitised,
            skipDuplicates: true // avoid inserting dupes
        })
        console.log(`Inserted ${result.count} results`)

    });
}

loadStars();