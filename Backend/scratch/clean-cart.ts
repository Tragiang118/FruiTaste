import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Fetching all cart items...');
    const cartItems = await prisma.cartItem.findMany();

    // Group items by cartId-productId
    const groups: { [key: string]: typeof cartItems } = {};
    for (const item of cartItems) {
      const key = `${item.cartId}-${item.productId}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    }

    console.log('Analyzing cart items for duplicates...');
    let mergedCount = 0;

    for (const key in groups) {
      const items = groups[key];
      if (items.length > 1) {
        // Sort by id ascending (keep the oldest)
        items.sort((a, b) => a.id - b.id);
        const keepItem = items[0];
        const deleteItems = items.slice(1);

        // Sum up quantities
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

        console.log(`Merging ${items.length} items for Cart ID: ${keepItem.cartId}, Product ID: ${keepItem.productId}. Combined quantity: ${totalQuantity}`);

        await prisma.$transaction([
          // Update the first item with the combined quantity
          prisma.cartItem.update({
            where: { id: keepItem.id },
            data: { quantity: totalQuantity },
          }),
          // Delete all other duplicates
          prisma.cartItem.deleteMany({
            where: {
              id: { in: deleteItems.map((item) => item.id) },
            },
          }),
        ]);

        mergedCount++;
      }
    }

    console.log(`Cart cleanup completed! Merged ${mergedCount} duplicate groups.`);
  } catch (err) {
    console.error('Cart cleanup failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
