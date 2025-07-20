/*
  Warnings:

  - A unique constraint covering the columns `[tripId,receiverEmail]` on the table `TripInvite` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TripInvite" ADD COLUMN     "receiverEmail" TEXT,
ALTER COLUMN "receiverId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TripInvite_tripId_receiverEmail_key" ON "TripInvite"("tripId", "receiverEmail");
