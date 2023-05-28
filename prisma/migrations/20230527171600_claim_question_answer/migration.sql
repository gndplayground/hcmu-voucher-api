-- AlterTable
ALTER TABLE "VoucherTicket" ADD COLUMN     "ownedBy" INTEGER;

-- CreateTable
CREATE TABLE "UserClaimQuestionAnswer" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "textAnswer" TEXT,
    "choiceId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserClaimQuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VoucherTicket" ADD CONSTRAINT "VoucherTicket_ownedBy_fkey" FOREIGN KEY ("ownedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserClaimQuestionAnswer" ADD CONSTRAINT "UserClaimQuestionAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserClaimQuestionAnswer" ADD CONSTRAINT "UserClaimQuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "VoucherQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserClaimQuestionAnswer" ADD CONSTRAINT "UserClaimQuestionAnswer_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "VoucherQuestionChoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
