import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Deleting all transactions...');
    await prisma.transaction.deleteMany({});

    console.log('Deleting all offers...');
    await prisma.offer.deleteMany({});

    console.log('Deleting all products...');
    const result = await prisma.product.deleteMany({});

    console.log(`Successfully deleted ${result.count} products.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
