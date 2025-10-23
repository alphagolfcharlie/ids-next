import fs from 'fs';
import {prisma} from "@/lib/prisma";

const filePath: string = 'data/jsons/ids.enroute.json';

interface EnrouteData {
    Field: string;
    Qualifier: string | null;
    Areas: string;
    Rule: string;
}

export async function loadEnroutes() {
    fs.readFile(filePath, 'utf8', async (err, jsonString: string) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const data: EnrouteData[] = JSON.parse(jsonString);

        const sanitised = data.map(item => ({ // .map applies the same function on each element - for each item, do this...
            fields: item.Field.split(",").map((word: string) => word.trim()),
            qualifier: item.Qualifier,
            areas: item.Areas.toString().split(",").map(str => Number(str.trim())), //.trim removes whitespaces
            rule: item.Rule,
        }));


        console.log(sanitised);

        // await prisma.enroute.deleteMany();

        const result = await prisma.enroute.createMany({
            data: sanitised,
            skipDuplicates: true // avoid inserting dupes
        })
        console.log(`Inserted ${result.count} results`)

    });
}

