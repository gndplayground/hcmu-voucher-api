import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import {
  VoucherCodeTypeEnum,
  VoucherDiscountCreateDto,
  VoucherDiscountUpdateDto,
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
}
