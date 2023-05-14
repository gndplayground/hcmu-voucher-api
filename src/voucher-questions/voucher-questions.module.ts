import { Module } from '@nestjs/common';
import { VoucherQuestionsService } from './voucher-questions.service';
import { VoucherQuestionsController } from './voucher-questions.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VoucherQuestionsService],
  controllers: [VoucherQuestionsController],
})
export class VoucherQuestionsModule {}
