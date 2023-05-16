/*
  Warnings:

  - You are about to drop the column `company` on the `UserProfile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VoucherDiscountType" AS ENUM ('PERCENTAGE', 'AMOUNT');

-- CreateEnum
CREATE TYPE "VoucherClaimType" AS ENUM ('FASTEST', 'QUESTIONS');

-- CreateEnum
CREATE TYPE "VoucherCodeType" AS ENUM ('MANUAL', 'CLAIM');

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "company",
ADD COLUMN     "companyId" INTEGER;

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campagin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "claimType" "VoucherClaimType",
    "claimMode" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "companyId" INTEGER,

    CONSTRAINT "Campagin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherDiscount" (
    "id" SERIAL NOT NULL,
    "campaginId" INTEGER NOT NULL,
    "description" TEXT,
    "type" "VoucherDiscountType" NOT NULL,
    "claimType" "VoucherClaimType",
    "claimMode" INTEGER,
    "code" TEXT,
    "codeType" "VoucherCodeType" NOT NULL,
    "discount" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoucherDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherTicket" (
    "id" SERIAL NOT NULL,
    "discountId" INTEGER NOT NULL,
    "code" TEXT,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "claimBy" INTEGER NOT NULL,
    "claimAt" TIMESTAMP(3),

    CONSTRAINT "VoucherTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openAt" TEXT,
    "closeAt" TEXT,
    "companyId" INTEGER,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoucherDiscount_code_campaginId_key" ON "VoucherDiscount"("code", "campaginId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campagin" ADD CONSTRAINT "Campagin_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campagin" ADD CONSTRAINT "Campagin_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherDiscount" ADD CONSTRAINT "VoucherDiscount_campaginId_fkey" FOREIGN KEY ("campaginId") REFERENCES "Campagin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherTicket" ADD CONSTRAINT "VoucherTicket_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "VoucherDiscount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherTicket" ADD CONSTRAINT "VoucherTicket_claimBy_fkey" FOREIGN KEY ("claimBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
