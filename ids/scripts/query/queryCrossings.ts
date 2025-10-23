import {PrismaClient} from "@prisma/client";

async function main() {
    
    const crossing = await prisma.crossing.findFirst()  // find first one
    const crossingRestriction = await prisma.crossing.findFirst({ // select certain db fields
        select: {
            restriction: true,
        }
    })
    const crossingExceptId = await prisma.crossing.findFirst({ // select all EXCEPT certain db fields
        omit: {
            id: true,
        }
    })

    const jfk = await prisma.crossing.findMany({
        omit: {
            id: true,
        },
        where: {
            field: 'JFK'
            // OR: startsWith, endsWith, contains, equals, has
        },
    })
    console.log(jfk)

    await prisma.$disconnect();
}

main()