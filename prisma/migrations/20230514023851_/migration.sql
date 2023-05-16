-- AlterTable
ALTER TABLE "VoucherQuestionChoice" ALTER COLUMN "isCorrect" DROP NOT NULL,
ALTER COLUMN "isCorrect" DROP DEFAULT,
ALTER COLUMN "isDeleted" DROP DEFAULT;
