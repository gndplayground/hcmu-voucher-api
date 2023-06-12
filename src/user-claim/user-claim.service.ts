import { AsyncLocalStorage } from 'async_hooks';
import isEqual from 'lodash/isEqual';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VoucherQuestionType } from '@prisma/client';
import { UserClaimQuestionAnswerDto } from './user-claim.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { CampaignsService } from '@/campaigns/campaigns.service';
import { VouchersService } from '@/vouchers/vouchers.service';
import {
  VoucherClaimTypeEnum,
  VoucherCodeTypeEnum,
} from '@/vouchers/vouchers.dto';
import { generateVoucherCode } from '@/common/generate';

@Injectable()
export class UserClaimService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly campaignService: CampaignsService,
    private readonly voucherService: VouchersService,
  ) {}

  async claimVoucher(
    options: {
      userId: number;
      voucherDiscountId: number;
      quenstionAnswers?: UserClaimQuestionAnswerDto[];
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    return await p.transaction(async (ctx, pt) => {
      const voucherDiscount = await pt.voucherDiscount.findUnique({
        where: {
          id: options.voucherDiscountId,
        },
        include: {
          voucherQuestions: {
            where: {
              isDeleted: false,
            },
            include: {
              voucherQuestionChoices: {
                where: {
                  isDeleted: false,
                },
              },
            },
          },
        },
      });

      if (!voucherDiscount) {
        throw new NotFoundException('Voucher not found');
      }

      if (voucherDiscount.isDeleted) {
        throw new BadRequestException('Voucher has been deleted');
      }

      if (
        voucherDiscount.claimType === VoucherClaimTypeEnum.QUESTIONS &&
        !options.quenstionAnswers
      ) {
        throw new BadRequestException('Voucher requires questions and answers');
      }

      const campaign = await this.campaignService.findOne(
        {
          id: voucherDiscount.campaignId,
        },
        ctx,
      );

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      if (campaign.isDeleted) {
        throw new BadRequestException('Campaign has been deleted');
      }

      if (campaign.startDate > new Date()) {
        throw new BadRequestException('Campaign has not started yet');
      }

      if (campaign.endDate < new Date()) {
        throw new BadRequestException('Campaign has ended');
      }

      if (
        campaign.claimType === VoucherClaimTypeEnum.QUESTIONS &&
        !options.quenstionAnswers
      ) {
        throw new BadRequestException('Voucher requires questions and answers');
      }

      const claimed = await this.voucherService.findOneTicket(
        {
          claimBy: options.userId,
          ownedBy: options.userId,
          discountId: voucherDiscount.id,
        },
        ctx,
      );

      if (claimed) {
        throw new BadRequestException('Voucher already claimed');
      }

      if (voucherDiscount.total === voucherDiscount.claimed) {
        throw new BadRequestException('Voucher has run out');
      }

      const voucherTicket = await pt.voucherTicket.create({
        data: {
          claimBy: options.userId,
          discountId: voucherDiscount.id,
          code:
            voucherDiscount.codeType === VoucherCodeTypeEnum.CLAIM
              ? generateVoucherCode()
              : undefined,
        },
      });

      await this.voucherService.updateDiscount(
        {
          id: voucherDiscount.id,
          data: {
            claimed: voucherDiscount.claimed + 1,
          },
        },
        ctx,
      );

      if (options.quenstionAnswers) {
        const listQuestion =
          (voucherDiscount.claimType === VoucherClaimTypeEnum.QUESTIONS
            ? voucherDiscount.voucherQuestions
            : campaign.voucherQuestions) || [];

        const require = listQuestion.reduce<{
          [key: number]: {
            isTextAnswer: boolean;
            choiceIds?: boolean;
            textAnswer?: boolean;
          };
        }>((result, q) => {
          const isTextAnswer = q.type === VoucherQuestionType.FREE;
          result[q.id] = {
            isTextAnswer,
            choiceIds: !isTextAnswer,
            textAnswer: isTextAnswer,
          };
          return result;
        }, {});

        const request = options.quenstionAnswers.reduce<{
          [key: number]: {
            isTextAnswer: boolean;
            choiceIds?: boolean;
            textAnswer?: boolean;
          };
        }>((result, q) => {
          const isTextAnswer = q.answer ? true : false;
          result[q.questionId] = {
            isTextAnswer: isTextAnswer,
            choiceIds: !isTextAnswer,
            textAnswer: isTextAnswer,
          };
          return result;
        }, {});

        if (!isEqual(require, request)) {
          throw new BadRequestException('Question and answer not match');
        }

        await pt.userClaimQuestionAnswer.createMany({
          data: options.quenstionAnswers.reduce<
            {
              questionId: number;
              userId: number;
              textAnswer?: string;
              choiceId?: number;
              ticketId: number;
            }[]
          >((result, qa) => {
            const { answer, choices, questionId } = qa;
            if (answer)
              result.push({
                userId: options.userId,
                questionId,
                textAnswer: answer,
                ticketId: voucherTicket.id,
              });
            if (qa.choices) {
              choices.forEach((c) => {
                result.push({
                  userId: options.userId,
                  questionId,
                  choiceId: c,
                  ticketId: voucherTicket.id,
                });
              });
            }
            return result;
          }, []),
        });
      }

      return voucherTicket;
    }, as);
  }

  async getVoucherTickets(
    options: {
      userId: number;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    return await p.voucherTicket.findMany({
      where: {
        OR: [
          {
            claimBy: options.userId,
          },
          {
            ownedBy: options.userId,
          },
        ],
      },
      orderBy: {
        claimAt: 'desc',
      },
      include: {
        voucherDiscount: {
          include: {
            campaign: true,
          },
        },
      },
    });
  }

  async checkCanClaim(
    options: {
      userId: number;
      voucherDiscountId: number;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const ticket = await this.voucherService.findOneTicket(
      {
        claimBy: options.userId,
        discountId: options.voucherDiscountId,
      },
      as,
    );
    return ticket ? false : true;
  }
}
