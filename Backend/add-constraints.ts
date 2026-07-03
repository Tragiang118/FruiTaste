import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Đang áp dụng Check Constraints vào PostgreSQL...');

  // 1. Chuẩn hóa dữ liệu cũ nếu có
  await prisma.$executeRawUnsafe(`
    UPDATE "PricingConfig" 
    SET "defaultProfitMargin" = 0.30 
    WHERE "defaultProfitMargin" < 0.05 OR "defaultProfitMargin" > 0.60;
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE "ProductPricing" 
    SET "customProfitMargin" = NULL 
    WHERE "customProfitMargin" IS NOT NULL AND ("customProfitMargin" < 0.05 OR "customProfitMargin" > 0.60);
  `);

  // 2. Thêm Constraint cho PricingConfig
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "PricingConfig" 
    DROP CONSTRAINT IF EXISTS check_default_profit_margin;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "PricingConfig" 
    ADD CONSTRAINT check_default_profit_margin 
    CHECK ("defaultProfitMargin" >= 0.05 AND "defaultProfitMargin" <= 0.60);
  `);

  // 3. Thêm Constraint cho ProductPricing
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ProductPricing" 
    DROP CONSTRAINT IF EXISTS check_custom_profit_margin;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ProductPricing" 
    ADD CONSTRAINT check_custom_profit_margin 
    CHECK ("customProfitMargin" IS NULL OR ("customProfitMargin" >= 0.05 AND "customProfitMargin" <= 0.60));
  `);

  console.log('✅ Đã thêm thành công ràng buộc CHECK (0.05 <= profitMargin <= 0.60) vào PostgreSQL Database!');
}

main()
  .catch((e) => {
    console.error('Lỗi khi áp dụng constraint:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
