/*
  Warnings:

  - You are about to drop the column `campaginId` on the `VoucherDiscount` table. All the data in the column will be lost.
  - You are about to drop the `Campagin` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code,campaignId]` on the table `VoucherDiscount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `campaignId` to the `VoucherDiscount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Campagin" DROP CONSTRAINT "Campagin_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Campagin" DROP CONSTRAINT "Campagin_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "VoucherDiscount" DROP CONSTRAINT "VoucherDiscount_campaginId_fkey";

-- DropIndex
DROP INDEX "VoucherDiscount_code_campaginId_key";

-- AlterTable
ALTER TABLE "VoucherDiscount" DROP COLUMN "campaginId",
ADD COLUMN     "campaignId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Campagin";

-- CreateTable
CREATE TABLE "Campaign" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "claimType" "VoucherClaimType",
    "claimMode" INTEGER,
    "isDeleted" BOOLEAN DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "companyId" INTEGER,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoucherDiscount_code_campaignId_key" ON "VoucherDiscount"("code", "campaignId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherDiscount" ADD CONSTRAINT "VoucherDiscount_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
