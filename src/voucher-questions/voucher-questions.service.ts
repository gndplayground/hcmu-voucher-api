import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import {
  VoucherQuestionChoiceUpdateDto,
  VoucherQuestionUpdateDto,
} from './voucher-questions.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class VoucherQuestionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async list(
    options: { campaignId?: number; discountId?: number } = {},
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prismaService,
      as,
    );
    return p.voucherQuestion.findMany({
      where: {
        campaignId: options.campaignId,
        discountId: options.discountId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        voucherQuestionChoices: true,
      },
    });
  }

  async update(
    options: { id?: number; data: VoucherQuestionUpdateDto },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prismaService,
      as,
    );
    return await p.voucherQuestion.update({
      where: {
        id: options.id,
      },
      data: options.data,
    });
  }

  async findOne(options: { id?: number } = {}, as?: AsyncLocalStorage<any>) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prismaService,
      as,
    );
    return await p.voucherQuestion.findUnique({
      where: {
        id: options.id,
      },
    });
  }

  async listChoices(
    options: { questionId: number },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prismaService,
      as,
    );
    return p.voucherQuestionChoice.findMany({
      where: {
        questionId: options.questionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateChoice(
    options: { id?: number; data: VoucherQuestionChoiceUpdateDto },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prismaService,
      as,
    );
    return await p.voucherQuestionChoice.update({
      where: {
        id: options.id,
      },
      data: options.data,
    });
  }

  async findOneChoice(
    options: { id?: number } = {},
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prismaService,
      as,
    );
    return await p.voucherQuestionChoice.findUnique({
      where: {
        id: options.id,
      },
    });
  }
}
