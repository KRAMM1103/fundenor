-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'Paggo',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';
