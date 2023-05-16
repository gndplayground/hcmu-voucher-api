/*
  Warnings:

  - Made the column `claimAt` on table `VoucherTicket` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "VoucherTicket" ALTER COLUMN "claimAt" SET NOT NULL,
ALTER COLUMN "claimAt" SET DEFAULT CURRENT_TIMESTAMP;
