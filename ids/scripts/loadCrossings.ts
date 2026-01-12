import fs from 'fs';
import {PrismaClient, artcc_choices} from '@prisma/client';
import {prisma} from "@/lib/prisma";


const filePath: string = 'data/jsons/static/ids.crossings.json';

interface CrossingsData {
    fields: string;
    bdry_fix: string | null;
    restriction: string;
    notes: string | null;
    artcc_giving: string;
    artcc_receiving: string;
}

export async function loadCrossings() {
    fs.readFile(filePath, 'utf8', async (err, jsonString: string) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const data: CrossingsData[] = JSON.parse(jsonString);

        const sanitised = data.map(item => ({
            fields: item.fields.split(','),
            fix: item.bdry_fix || null,
            restriction: item.restriction.toString(),
            notes: item.notes || null,
            artcc_giving: "ZME" as artcc_choices, // directly cast the string as an enum
            artcc_receiving: item.artcc_receiving as artcc_choices
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

