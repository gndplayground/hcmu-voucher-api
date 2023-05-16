import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CampaignCreateDto,
  CampaignDto,
  CampaignProgressEnum,
  CampaignUpdateDto,
} from './campaigns.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { VoucherDiscountCreateWithCampaignDto } from '@/vouchers/vouchers.dto';
import { VouchersService } from '@/vouchers/vouchers.service';
import { VoucherQuestionCreateDto } from '@/voucher-questions/voucher-questions.dto';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vouchersService: VouchersService,
  ) {}

  async list(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      isDisabled?: boolean;
      isDeleted?: boolean;
      progress?: CampaignProgressEnum;
    } = {},
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    let dateFilter = {};

    switch (options.progress) {
      case CampaignProgressEnum.ONGOING: {
        dateFilter = {
          endDate: {
            gt: new Date(),
          },
          startDate: {
            lt: new Date(),
          },
        };
        break;
      }
      case CampaignProgressEnum.FINISHED: {
        dateFilter = {
          endDate: {
            lt: new Date(),
          },
        };
        break;
      }
      case CampaignProgressEnum.UPCOMING: {
        dateFilter = {
          startDate: {
            gt: new Date(),
          },
        };
        break;
      }
    }

    const { limit = 10, page = 1 } = options;

    return p.campaign.findMany({
      skip: Math.max(page - 1, 0) * limit,
      take: limit,
      where: {
        name: {
          contains: options.search,
        },
        ...dateFilter,
        isDeleted: options.isDeleted || false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        voucherDiscounts: true,
        voucherQuestions: true,
      },
    });
  }

  async findOne(
    query: { id?: number },
    as?: AsyncLocalStorage<any>,
  ): Promise<CampaignDto> {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    const result = (await p.campaign.findUnique({
      where: {
        id: query.id,
      },
    })) as CampaignDto;

    return result;
  }

  async createFull(
    data: {
      campaign: CampaignCreateDto;
      createdBy: number;
      companyId: number;
      discounts: VoucherDiscountCreateWithCampaignDto[];
      questions?: VoucherQuestionCreateDto[];
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    return await p.transaction(async (ctx) => {
      const campaign = await this.create(
        {
          campaign: data.campaign,
          companyId: data.companyId,
          createdBy: data.createdBy,
          questions: data.questions,
        },
        ctx,
      );
      await Promise.all(
        data.discounts.map((d) =>
          this.vouchersService.createDiscount(
            {
              data: {
                campaignId: campaign.id,
                ...d,
              },
            },
            ctx,
          ),
        ),
      );
      return campaign;
    });
  }

  async create(
    data: {
      campaign: CampaignCreateDto;
      createdBy: number;
      companyId: number;
      questions?: VoucherQuestionCreateDto[];
    },
    as?: AsyncLocalStorage<any>,
  ): Promise<CampaignDto> {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    const questions = data.questions
      ? data.questions.map((q) => {
          const { choices, ...other } = q;
          return {
            ...other,
            voucherQuestionChoices: {
              create: choices,
            },
          };
        })
      : undefined;
    return p.campaign.create({
      data: {
        ...data.campaign,
        companyId: data.companyId,
        createdBy: data.createdBy,
        voucherQuestions: {
          create: questions,
        },
      } as Prisma.CampaignUncheckedCreateInput,
    });
  }

  async update({
    id,
    data,
  }: {
    id: number;
    data: CampaignUpdateDto;
  }): Promise<CampaignDto> {
    return await this.prisma.campaign.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
  }

  async test1(as1?: AsyncLocalStorage<any>) {
    await this.prisma.transaction(async (as) => {
      await this.list({}, as);
    }, as1);
  }

  async test() {
    await this.prisma.transaction(async (as) => {
      await this.list({}, as);
      await this.test1(as);
    });
  }
}
