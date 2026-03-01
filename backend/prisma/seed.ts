import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create Demo Seller
    const sellerPassword = await bcrypt.hash('seller123', 10);
    const seller = await prisma.user.upsert({
        where: { email: 'seller@bargainhub.com' },
        update: {},
        create: {
            email: 'seller@bargainhub.com',
            name: 'Premium Electronics Co.',
            passwordHash: sellerPassword,
            role: 'SELLER',
            reputationScore: 489,
        },
    });

    // Create Demo Product
    const product = await prisma.product.create({
        data: {
            sellerId: seller.id,
            title: 'Sony WH-1000XM5 Noise Canceling Headphones',
            description: 'Industry-leading noise cancellation headphones. Brand new, sealed in box with 1-year warranty.',
            images: '[]',
            publicPrice: 398.00,
            autoAcceptFloorPrice: 350.00,
            autoCounterFloorPrice: 300.00,
            inventoryCount: 5,
        },
    });

    console.log('Database seeded with Demo Seller and Product!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
