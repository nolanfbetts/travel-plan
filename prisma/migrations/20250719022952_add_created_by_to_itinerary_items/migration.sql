/*
  Warnings:

  - Added the required column `createdById` to the `ItineraryItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ItineraryItem" ADD COLUMN     "createdById" TEXT;

-- Update existing records to set createdById to the trip creator
UPDATE "ItineraryItem" 
SET "createdById" = (
  SELECT "creatorId" 
  FROM "Trip" 
  WHERE "Trip"."id" = "ItineraryItem"."tripId"
);

-- Make the column NOT NULL after updating existing records
ALTER TABLE "ItineraryItem" ALTER COLUMN "createdById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ItineraryItem" ADD CONSTRAINT "ItineraryItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
