import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { UploadModule } from '@/upload/upload.module';
import { VouchersModule } from '@/vouchers/vouchers.module';
import { UserModule } from '@/user/user.module';

import { VoucherQuestionsModule } from '@/voucher-questions/voucher-questions.module';

@Module({
  imports: [
    PrismaModule,
    UploadModule,
    VouchersModule,
    UserModule,
    VoucherQuestionsModule,
  ],
  providers: [CampaignsService],
  controllers: [CampaignsController],
  exports: [CampaignsService],
})
export class CampaignsModule {}
