-- AlterTable
ALTER TABLE "UserClaimQuestionAnswer" ADD COLUMN     "ticketId" INTEGER;

-- AddForeignKey
ALTER TABLE "UserClaimQuestionAnswer" ADD CONSTRAINT "UserClaimQuestionAnswer_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "VoucherTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
