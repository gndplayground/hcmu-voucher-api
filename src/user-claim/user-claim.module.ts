import { Module } from '@nestjs/common';
import { UserClaimService } from './user-claim.service';
import { UserClaimController } from './user-claim.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CampaignsModule } from '@/campaigns/campaigns.module';
import { VouchersModule } from '@/vouchers/vouchers.module';

@Module({
  imports: [PrismaModule, CampaignsModule, VouchersModule],
  providers: [UserClaimService],
  exports: [UserClaimService],
  controllers: [UserClaimController],
})
export class UserClaimModule {}
