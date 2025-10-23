import {PrismaClient} from "@prisma/client";

async function main() {
    
    const cle = await prisma.enroute.findMany({
        where: {
            fields: {
                has: 'CLE'
            },
            areas: {
                has: 7
            },
            qualifier: {
                contains: 'Arrivals'
            }
        },
    })
    console.log(cle)

    await prisma.$disconnect();
}

main()