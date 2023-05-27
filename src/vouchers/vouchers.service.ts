import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { VoucherDiscount } from '@prisma/client';
import {
  VoucherCodeTypeEnum,
  VoucherDiscountCreateDto,
  VoucherDiscountUpdateDto,
  VoucherDiscountUpdateWithCampaignDto,
  VoucherTicketCreateDto,
} from './vouchers.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { VoucherQuestionsService } from '@/voucher-questions/voucher-questions.service';

@Injectable()
export class VouchersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly voucherQuestionService: VoucherQuestionsService,
  ) {}

  async listDiscount(
    options: {
      campaignId?: number;
    } = {},
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    return p.voucherDiscount.findMany({
      where: {
        campaignId: options.campaignId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        voucherQuestions: {
          orderBy: {
            createdAt: 'asc',
          },
          where: {
            isDeleted: false,
          },
        },
      },
    });
  }

  async findOneDiscount(
    options: {
      id?: number;
      campaignId?: number;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    return await p.voucherDiscount.findFirst({
      where: {
        id: options.id,
        campaignId: options.campaignId,
      },
      include: {
        voucherQuestions: true,
      },
    });
  }

  async updateDiscount(
    options: {
      data: VoucherDiscountUpdateDto;
      id?: number;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    return await p.voucherDiscount.update({
      where: {
        id: options.id,
      },
      data: options.data,
    });
  }

  async createDiscount(
    options: {
      data: VoucherDiscountCreateDto;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const { questions, ...others } = options.data;

    const questionsCreate = questions
      ? questions.map((q) => {
          const { choices, ...other } = q;
          return {
            ...other,
            voucherQuestionChoices: {
              create: choices,
            },
          };
        })
      : undefined;

    return await p.voucherDiscount.create({
      data: {
        codeType: VoucherCodeTypeEnum.CLAIM,
        ...others,
        voucherQuestions: questions
          ? {
              create: questionsCreate,
            }
          : undefined,
      },
    });
  }

  async findOneTicket(
    options: {
      id?: number;
      claimBy?: number;
      discountId?: number;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    return await p.voucherTicket.findFirst({
      where: {
        id: options.id,
        claimBy: options.claimBy,
        discountId: options.discountId,
      },
    });
  }

  async createTicket(
    data: VoucherTicketCreateDto,
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    return await p.transactionLocal(async (prisma) => {
      const discount = await prisma.voucherDiscount.findUnique({
        where: {
          id: data.discountId,
        },
      });

      if (discount.total <= 0) throw new Error('Voucher is out of stock');

      const ticket = await prisma.voucherTicket.create({
        data,
      });

      await prisma.voucherDiscount.update({
        where: {
          id: data.discountId,
        },
        data: {
          total: discount.total - 1,
        },
      });

      return ticket;
    }, as);
  }

  async listUserTicket(data: { userId: number }, as?: AsyncLocalStorage<any>) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    return await p.campaign.findMany({
      include: {
        voucherDiscounts: {
          include: {
            voucherTickets: true,
          },
        },
      },
      where: {
        voucherDiscounts: {
          some: {
            voucherTickets: {
              some: {
                claimBy: data.userId,
              },
            },
          },
        },
      },
    });
  }

  async updateManyDiscount(
    options: {
      data: VoucherDiscountUpdateWithCampaignDto[];
      campaignId?: number;
      userCompanyId: number;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const update = async (discount: VoucherDiscountUpdateWithCampaignDto) => {
      const { questions = [], id, ...others } = discount;

      let finalDiscount: VoucherDiscount;

      if (id) {
        finalDiscount = await p.voucherDiscount.update({
          where: {
            id: id,
          },
          data: {
            ...others,
          },
        });
      } else {
        finalDiscount = await p.voucherDiscount.create({
          data: {
            ...(others as any),
            campaignId: options.campaignId,
          },
        });
      }

      await this.voucherQuestionService.updateMany(
        {
          userCompanyId: options.userCompanyId,
          data: questions.map((q) => {
            q.discountId = finalDiscount.id;
            return q;
          }),
        },
        as,
      );
    };

    await Promise.all(options.data.map(update));
  }
}
