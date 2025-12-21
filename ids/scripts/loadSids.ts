import fs from 'fs';
import {PrismaClient} from '@prisma/client';
import {prisma} from "@/lib/prisma";


const airac = process.env.AIRAC;

const filePath: string = `data/jsons/${airac}/sid.json`;

interface Sid {
    sid_name: string;
    served_arpt: string;
    fixes: string;
}

export async function loadSids() {
    fs.readFile(filePath, 'utf8', async (err, jsonString: string) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const data: Sid[] = JSON.parse(jsonString);

        const sanitised = data.map(item => ({
            sid_code: item.sid_name,
            apts: item.served_arpt.split(' '),
            fixes: item.fixes.split(' '),
        }));


        await prisma.sid.deleteMany(); // delete all existing SIDs

        console.log("All SIDs deleted!")

        const result = await prisma.sid.createMany({
            data: sanitised,
            skipDuplicates: true // avoid inserting dupes
        })
        console.log(`Inserted ${result.count} results`)

    });


}