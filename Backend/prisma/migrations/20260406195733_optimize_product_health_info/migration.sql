ALTER TABLE "Product" DROP COLUMN "healthBenefits",
DROP COLUMN "healthWarnings",
DROP COLUMN "nutritionFacts",
ADD COLUMN     "healthInfo" JSONB;
