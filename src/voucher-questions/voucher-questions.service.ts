import { AsyncLocalStorage } from 'async_hooks';
import { ForbiddenException, Injectable } from '@nestjs/common';
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
    options: {
      id?: number;
      data: VoucherQuestionUpdateDto;
      userCompanyId: number;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prismaService,
      as,
    );

    const currentQuestion = await this.findOne({
      id: options.id,
    });

    if (currentQuestion.campaignId) {
      const campaign = await p.campaign.findUnique({
        where: {
          id: currentQuestion.campaignId,
        },
      });

      if (campaign.companyId !== options.userCompanyId) {
        throw new ForbiddenException(
          'You are not allowed to edit this question',
        );
      }
    } else if (currentQuestion.discountId) {
      const discount = await p.voucherDiscount.findUnique({
        where: {
          id: currentQuestion.discountId,
        },
        include: {
          campaign: true,
        },
      });

      if (discount.campaign.companyId !== options.userCompanyId) {
        throw new ForbiddenException(
          'You are not allowed to edit this question',
        );
      }
    }

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
