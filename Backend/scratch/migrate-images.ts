import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Starting migration of images column...');

    // 1. Add the imageUrl column to the Product table
    console.log('Adding "imageUrl" column...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
    `);

    // 2. Copy the first element of "images" to "imageUrl"
    console.log('Copying image data from "images" to "imageUrl"...');
    await prisma.$executeRawUnsafe(`
      UPDATE "Product" 
      SET "imageUrl" = "images"[1] 
      WHERE "images" IS NOT NULL AND array_length("images", 1) > 0;
    `);

    // 3. Drop the old "images" column
    console.log('Dropping old "images" column...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" DROP COLUMN IF EXISTS "images";
    `);

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
