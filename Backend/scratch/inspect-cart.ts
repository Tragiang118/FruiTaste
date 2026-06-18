import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('--- DIAGNOSTIC START ---');
    
    // 1. Check for products with the name "Lê Đường Lạng Sơn"
    console.log('\nChecking Product Table for "Lê Đường Lạng Sơn":');
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: 'Lê Đường Lạng Sơn',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        isActive: true,
        isDeleted: true,
      }
    });
    console.log(JSON.stringify(products, null, 2));

    // 2. Fetch all cart items grouped by product details
    console.log('\nChecking Cart Items in database:');
    const cartItems = await prisma.cartItem.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          }
        }
      }
    });

    console.log(`Total cart items in database: ${cartItems.length}`);
    cartItems.forEach(item => {
      console.log(`Cart ID: ${item.cartId} | Item ID: ${item.id} | Product ID: ${item.productId} (${item.product?.name}) | Qty: ${item.quantity}`);
    });

    console.log('\n--- DIAGNOSTIC END ---');
  } catch (err) {
    console.error('Inspection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
