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
import {
  VoucherDiscountCreateWithCampaignDto,
  VoucherDiscountUpdateWithCampaignDto,
} from '@/vouchers/vouchers.dto';
import { VouchersService } from '@/vouchers/vouchers.service';
import {
  VoucherQuestionCreateDto,
  VoucherQuestionUpdateWithCampaignDto,
} from '@/voucher-questions/voucher-questions.dto';
import { VoucherQuestionsService } from '@/voucher-questions/voucher-questions.service';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vouchersService: VouchersService,
    private readonly voucherQuestionsService: VoucherQuestionsService,
  ) {}

  async list(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      isDisabled?: boolean;
      isDeleted?: boolean;
      progress?: CampaignProgressEnum;
      companyId?: number;
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
        companyId: options.companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        company: true,
        voucherDiscounts: {
          where: {
            isDeleted: {
              equals: false,
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            voucherQuestions: false,
            voucherTickets: false,
          },
        },
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
    const result = (await p.campaign.findFirst({
      where: {
        id: query.id,
      },
      include: {
        company: true,
        voucherDiscounts: {
          where: {
            isDeleted: {
              equals: false,
            },
          },
          include: {
            voucherQuestions: {
              where: {
                isDeleted: false,
              },
              orderBy: {
                createdAt: 'asc',
              },
              include: {
                voucherQuestionChoices: {
                  where: {
                    isDeleted: {
                      equals: false,
                    },
                  },
                  orderBy: {
                    createdAt: 'asc',
                  },
                },
              },
            },
          },
        },
        voucherQuestions: {
          orderBy: {
            createdAt: 'asc',
          },
          where: {
            isDeleted: false,
          },
          include: {
            voucherQuestionChoices: {
              where: {
                isDeleted: false,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
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

  async updateFull(
    data: {
      id: number;
      campaign: CampaignUpdateDto;
      discounts: VoucherDiscountUpdateWithCampaignDto[];
      questions?: VoucherQuestionUpdateWithCampaignDto[];
      userCompanyId: number;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    return await p.transaction(async (ctx, pt) => {
      const questionsUpdate = data.questions?.filter((q) => !!q.id) || [];

      const questionsCreateNew =
        data.questions
          ?.filter((q) => !q.id)
          ?.map((q) => {
            const { ...other } = q;
            return {
              ...other,
              campaignId: data.id,
            };
          }) || [];

      await pt.campaign.update({
        where: {
          id: data.id,
        },
        data: {
          ...data.campaign,
        },
      });

      await this.voucherQuestionsService.updateMany(
        {
          userCompanyId: data.userCompanyId,
          data: [questionsUpdate, questionsCreateNew].flat(),
        },
        ctx,
      );

      await this.vouchersService.updateManyDiscount(
        {
          userCompanyId: data.userCompanyId,
          data: data.discounts,
          campaignId: data.id,
        },
        ctx,
      );
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

  async update(
    {
      id,
      data,
    }: {
      id: number;
      data: CampaignUpdateDto;
    },
    as?: AsyncLocalStorage<any>,
  ): Promise<CampaignDto> {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    return await p.campaign.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
  }
}
