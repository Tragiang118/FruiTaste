"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        console.log('Starting migration of images column...');
        console.log('Adding "imageUrl" column...');
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
    `);
        console.log('Copying image data from "images" to "imageUrl"...');
        await prisma.$executeRawUnsafe(`
      UPDATE "Product" 
      SET "imageUrl" = "images"[1] 
      WHERE "images" IS NOT NULL AND array_length("images", 1) > 0;
    `);
        console.log('Dropping old "images" column...');
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" DROP COLUMN IF EXISTS "images";
    `);
        console.log('Migration completed successfully!');
    }
    catch (err) {
        console.error('Migration failed:', err);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=migrate-images.js.map