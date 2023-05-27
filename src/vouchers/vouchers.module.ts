import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { VoucherQuestionsModule } from '@/voucher-questions/voucher-questions.module';

@Module({
  providers: [VouchersService],
  exports: [VouchersService],
  imports: [PrismaModule, VoucherQuestionsModule],
  controllers: [VouchersController],
})
export class VouchersModule {}
