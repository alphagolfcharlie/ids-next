import fs from 'fs';
import {PrismaClient, artcc_choices} from '@prisma/client';
import {prisma} from "@/lib/prisma";


const filePath: string = 'data/jsons/ids.crossings.json';

interface CrossingsData {
    destination: string;
    bdry_fix: string | null;
    restriction: string;
    notes: string | null;
    artcc: string;
}

export async function loadCrossings() {
    fs.readFile(filePath, 'utf8', async (err, jsonString: string) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const data: CrossingsData[] = JSON.parse(jsonString);

        const sanitised = data.map(item => ({
            field: item.destination,
            fix: item.bdry_fix || null,
            restriction: item.restriction.toString(),
            notes: item.notes || null,
            artcc_giving: "ZOB" as artcc_choices, // directly cast the string as an enum
            artcc_receiving: item.artcc as artcc_choices
        }));

        // for item in data, sanitised.append that ^

        const result = await prisma.crossing.createMany({
            data: sanitised,
            skipDuplicates: true // avoid inserting dupes
        })
        console.log(`Inserted ${result.count} results`)
        console.log(err);
    });
}

