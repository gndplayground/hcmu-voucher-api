import { AsyncLocalStorage } from 'async_hooks';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { endOfWeek, format, startOfWeek } from 'date-fns';
import {
  CampaignCreateDto,
  CampaignDto,
  CampaignProgressEnum,
  CampaignUpdateDto,
} from './campaigns.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  VoucherClaimTypeEnum,
  VoucherDiscountCreateWithCampaignDto,
  VoucherDiscountUpdateWithCampaignDto,
} from '@/vouchers/vouchers.dto';
import { VouchersService } from '@/vouchers/vouchers.service';
import {
  VoucherQuestionCreateDto,
  VoucherQuestionTypeEnum,
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
          contains: options.search ? `${options.search}` : undefined,
          mode: 'insensitive',
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

  async stats(
    { id, start }: { id: number; start: Date },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const firstDayOfWeek = startOfWeek(start, { weekStartsOn: 1 });

    const endDayOfWeek = endOfWeek(start, { weekStartsOn: 1 });

    const claimedByWeek = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    };

    const tickets = await p.voucherTicket.findMany({
      where: {
        voucherDiscount: {
          campaignId: id,
        },
        claimAt: {
          gte: firstDayOfWeek,
          lte: endDayOfWeek,
        },
      },
    });

    tickets.forEach((t) => {
      const day = format(t.claimAt, 'EEEE').toLowerCase();
      claimedByWeek[day] += 1;
    });

    const voucherDiscounts = await p.voucherDiscount.findMany({
      where: {
        campaignId: id,
      },
    });

    let claimed = 0;
    let unclaimed = 0;

    voucherDiscounts.forEach((vd) => {
      claimed += vd.claimed;
      unclaimed += vd.total - vd.claimed;
    });

    return {
      claimedByWeek,
      claimed,
      unclaimed,
    };
  }

  async discountStats(
    { id, campaignId, start }: { id: number; start: Date; campaignId: number },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const campaign = await p.campaign.findUnique({
      where: {
        id: campaignId,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const discount = await p.voucherDiscount.findUnique({
      where: {
        id,
      },
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    const firstDayOfWeek = startOfWeek(start, { weekStartsOn: 1 });

    const endDayOfWeek = endOfWeek(start, { weekStartsOn: 1 });

    const claimedByWeek = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    };

    const tickets = await p.voucherTicket.findMany({
      where: {
        voucherDiscount: {
          id,
        },
        claimAt: {
          gte: firstDayOfWeek,
          lte: endDayOfWeek,
        },
      },
      include: {
        // userClaimQuestionAnswers: true,
        voucherDiscount: true,
      },
    });

    const claimQuestionTickets: number[] = [];

    tickets.forEach((t) => {
      const day = format(t.claimAt, 'EEEE').toLowerCase();
      claimedByWeek[day] += 1;
      if (
        campaign.claimType === VoucherClaimTypeEnum.QUESTIONS ||
        t.voucherDiscount?.claimType === VoucherClaimTypeEnum.QUESTIONS
      ) {
        claimQuestionTickets.push(t.id);
      }
    });

    const claimQuestionAnswers = await p.userClaimQuestionAnswer.findMany({
      where: {
        ticketId: {
          in: claimQuestionTickets,
        },
      },
    });

    const questions = await p.voucherQuestion.findMany({
      where: {
        campaignId:
          campaign.claimType === VoucherClaimTypeEnum.QUESTIONS
            ? campaign.id
            : undefined,
        discountId:
          campaign.claimType !== VoucherClaimTypeEnum.QUESTIONS
            ? discount.id
            : undefined,
      },
      include: {
        voucherQuestionChoices: true,
      },
    });

    questions.forEach((q) => {
      if (
        q.type === VoucherQuestionTypeEnum.MULTIPLE_CHOICE ||
        q.type === VoucherQuestionTypeEnum.SINGLE_CHOICE
      ) {
        const answers = claimQuestionAnswers.filter(
          (a) => a.questionId === q.id,
        );
        const choices = q.voucherQuestionChoices;
        choices.forEach((c) => {
          (c as any).count = answers.filter((a) => a.choiceId === c.id).length;
        });
        q.voucherQuestionChoices = choices;
      }
    });

    const claimed = discount.claimed;

    const unclaimed = discount.total - discount.claimed;

    return {
      claimedByWeek,
      claimed,
      unclaimed,
      questions,
    };
  }

  async discountQuestionStats(
    { id, campaignId }: { id: number; campaignId: number },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const campaign = await p.campaign.findUnique({
      where: {
        id: campaignId,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const discount = await p.voucherDiscount.findUnique({
      where: {
        id,
      },
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    const claimQuestionTickets: number[] = [];

    const tickets = await p.voucherTicket.findMany({
      where: {
        voucherDiscount: {
          id,
        },
      },
      include: {
        voucherDiscount: true,
      },
    });

    tickets.forEach((t) => {
      if (
        campaign.claimType === VoucherClaimTypeEnum.QUESTIONS ||
        t.voucherDiscount?.claimType === VoucherClaimTypeEnum.QUESTIONS
      ) {
        claimQuestionTickets.push(t.id);
      }
    });

    const claimQuestionAnswers = await p.userClaimQuestionAnswer.findMany({
      where: {
        ticketId: {
          in: claimQuestionTickets,
        },
      },
    });

    const questions = await p.voucherQuestion.findMany({
      where: {
        campaignId:
          campaign.claimType === VoucherClaimTypeEnum.QUESTIONS
            ? campaign.id
            : undefined,
        discountId:
          campaign.claimType !== VoucherClaimTypeEnum.QUESTIONS
            ? discount.id
            : undefined,
      },
      include: {
        voucherQuestionChoices: true,
      },
    });

    questions.forEach((q) => {
      if (
        q.type === VoucherQuestionTypeEnum.MULTIPLE_CHOICE ||
        q.type === VoucherQuestionTypeEnum.SINGLE_CHOICE
      ) {
        const answers = claimQuestionAnswers.filter(
          (a) => a.questionId === q.id,
        );
        const choices = q.voucherQuestionChoices;
        choices.forEach((c) => {
          (c as any).count = answers.filter((a) => a.choiceId === c.id).length;
        });
        q.voucherQuestionChoices = choices;
      }
    });

    return {
      questions,
    };
  }
}
