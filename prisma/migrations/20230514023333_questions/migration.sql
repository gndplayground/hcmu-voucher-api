-- CreateEnum
CREATE TYPE "VoucherQuestionType" AS ENUM ('FREE', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE');

-- CreateTable
CREATE TABLE "VoucherQuestion" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "type" "VoucherQuestionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" INTEGER,
    "discountId" INTEGER,
    "isDeleted" BOOLEAN DEFAULT false,

    CONSTRAINT "VoucherQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherQuestionChoice" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "choice" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoucherQuestionChoice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VoucherQuestion" ADD CONSTRAINT "VoucherQuestion_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherQuestion" ADD CONSTRAINT "VoucherQuestion_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "VoucherDiscount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherQuestionChoice" ADD CONSTRAINT "VoucherQuestionChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "VoucherQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
