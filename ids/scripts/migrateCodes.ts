import {prisma} from "@/lib/prisma";

async function migrate() {
    const crossings = await prisma.crossing.findMany();

    for (const c of crossings) {
        console.log(c)
        await prisma.crossing.update({
            where: { id: c.id },
            data: {
                fields: [c.field],
            },
        });
    }
}

migrate()
    .then(() => console.log('Migration complete'))
    .catch(console.error)
    .finally(() => prisma.$disconnect());
