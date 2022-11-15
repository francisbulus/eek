-- CreateEnum
CREATE TYPE "business_cities" AS ENUM ('atlanta', 'boston', 'chicago', 'dallas', 'new_york_city', 'philadelphia');

-- UpdateTable
UPDATE "businesses" SET "city" = LOWER(REPLACE(TRIM("city"), ' ', '_'));

-- AlterTable
ALTER TABLE "businesses"
ALTER COLUMN "city" TYPE "business_cities"
USING "city"::"business_cities";
