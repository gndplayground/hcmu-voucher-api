import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { UploadModule } from '@/upload/upload.module';
import { VouchersModule } from '@/vouchers/vouchers.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [PrismaModule, UploadModule, VouchersModule, UserModule],
  providers: [CampaignsService],
  controllers: [CampaignsController],
})
export class CampaignsModule {}
