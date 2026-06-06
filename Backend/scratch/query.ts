import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Querying cart...');
    const carts = await prisma.cart.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                mediaUrls: true,
                stockQuantity: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
    console.log('Carts found:', JSON.stringify(carts, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
