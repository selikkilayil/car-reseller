-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "bookingAmount" DOUBLE PRECISION,
ADD COLUMN     "bookingDate" TIMESTAMP(3),
ADD COLUMN     "bookingPartyId" TEXT,
ADD COLUMN     "isBooked" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_bookingPartyId_fkey" FOREIGN KEY ("bookingPartyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;
