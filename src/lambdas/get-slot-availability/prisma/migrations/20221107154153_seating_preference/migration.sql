-- CreateEnum
CREATE TYPE "seating_location_types" AS ENUM ('indoor', 'outdoor', 'unknown');

-- CreateTable
CREATE TABLE "seating_preferences" (
    "id" SERIAL NOT NULL,
    "location_title" TEXT NOT NULL,
    "location_type" "seating_location_types" NOT NULL,
    "is_bookable" BOOLEAN NOT NULL DEFAULT false,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMPTZ(6) NOT NULL,
    "archived_on" TIMESTAMPTZ(6),

    CONSTRAINT "seating_preferences_pkey" PRIMARY KEY ("id")
);
