import { AsyncLocalStorage } from 'async_hooks';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { VoucherQuestion } from '@prisma/client';
import {
  VoucherQuestionChoiceUpdateDto,
  VoucherQuestionUpdateDto,
  VoucherQuestionUpdateWithCampaignDto,
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
        createdAt: 'asc',
      },
      include: {
        voucherQuestionChoices: {
          orderBy: {
            createdAt: 'asc',
          },
        },
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
      include: {
        voucherQuestionChoices: {
          orderBy: {
            createdAt: 'asc',
          },
        },
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

  async updateMany(
    options: {
      data: VoucherQuestionUpdateWithCampaignDto[];
      userCompanyId: number;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prismaService,
      as,
    );

    const update = async (question: VoucherQuestionUpdateWithCampaignDto) => {
      if (question.id) {
        const currentQuestion = await this.findOne({
          id: question.id,
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
      }

      const { choices = [], id, ...others } = question;
      let finalQuestion: VoucherQuestion;
      if (id) {
        finalQuestion = await p.voucherQuestion.update({
          where: {
            id: id,
          },
          data: others,
        });
      } else {
        finalQuestion = await p.voucherQuestion.create({
          data: others as any,
        });
      }

      await Promise.all(
        [
          choices
            .filter((choice) => choice.id)
            .map((choice) => {
              return this.updateChoice(
                {
                  id: choice.id,
                  data: choice,
                },
                as,
              );
            }),
          choices
            .filter((choice) => !choice.id)
            .map((choice) => {
              return p.voucherQuestionChoice.create({
                data: {
                  ...choice,
                  questionId: finalQuestion.id,
                },
              });
            }),
        ].flat(),
      );
    };

    await Promise.all(
      options.data.map((question) => {
        return update(question);
      }),
    );
  }
}
