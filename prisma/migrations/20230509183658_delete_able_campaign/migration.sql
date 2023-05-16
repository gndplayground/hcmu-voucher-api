-- AlterTable
ALTER TABLE "Campagin" ADD COLUMN     "isDeleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "isDeleted" BOOLEAN DEFAULT false,
ADD COLUMN     "isDisabled" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "isDeleted" BOOLEAN DEFAULT false;
