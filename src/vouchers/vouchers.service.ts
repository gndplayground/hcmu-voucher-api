import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import {
  VoucherCodeTypeEnum,
  VoucherDiscountCreateDto,
  VoucherDiscountUpdateDto,
  VoucherTicketCreateDto,
} from './vouchers.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

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
    });
  }

  async findOneDiscount(
    options: {
      id?: number;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    return await p.voucherDiscount.findUnique({
      where: {
        id: options.id,
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
    return await p.voucherDiscount.create({
      data: {
        codeType: VoucherCodeTypeEnum.CLAIM,
        ...options.data,
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
}
