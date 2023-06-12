import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}
  async getStats(companyId: number, as?: AsyncLocalStorage<any>) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prismaService,
      as,
    );

    const campaigns = await Promise.all([
      p.campaign.count({
        where: {
          isDeleted: false,
          companyId,
          endDate: {
            gt: new Date(),
          },
          startDate: {
            lt: new Date(),
          },
        },
      }),
      p.campaign.count({
        where: {
          isDeleted: false,
          companyId,
          startDate: {
            gt: new Date(),
          },
        },
      }),
      p.campaign.count({
        where: {
          isDeleted: false,
          companyId,
          endDate: {
            lt: new Date(),
          },
        },
      }),
    ]);

    const totalVouchers = await p.voucherDiscount.count({
      where: {
        isDeleted: false,
        campaign: {
          isDeleted: false,
          companyId,
        },
      },
    });

    const totalUserClaims = await p.voucherTicket.findMany({
      where: {
        voucherDiscount: {
          campaign: {
            companyId,
          },
        },
      },
      distinct: ['claimBy'],
    });

    const claimed = await p.voucherTicket.count({
      where: {
        voucherDiscount: {
          campaign: {
            companyId,
          },
        },
      },
    });

    return {
      activeCampaigns: campaigns[0],
      upcomingCampaigns: campaigns[1],
      pastCampaigns: campaigns[2],
      claimedVouchers: claimed,
      totalVouchers,
      totalUserClaims: totalUserClaims.length,
    };
  }
}
