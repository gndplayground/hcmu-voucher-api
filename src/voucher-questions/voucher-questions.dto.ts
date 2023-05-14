import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, Validate } from 'class-validator';
import {
  VoucherQuestion,
  VoucherQuestionChoice,
  VoucherQuestionType as baseVoucherQuestionType,
} from 'prisma/prisma-client';
import { RequiredIfValueValidator } from '@/common/validators';
import { TransformNumber } from '@/common/transforms';

export enum VoucherQuestionTypeEnum {
  FREE = 'FREE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
}

export type VoucherQuestionType =
  (typeof baseVoucherQuestionType)[keyof typeof baseVoucherQuestionType];

export class VoucherQuestionChoiceDto implements VoucherQuestionChoice {
  @ApiProperty()
  id: number;

  @ApiProperty()
  questionId: number;

  @ApiProperty()
  choice: string;

  @ApiProperty({
    required: false,
  })
  isCorrect: boolean | null;

  @ApiProperty({
    required: false,
  })
  isDeleted: boolean | null;

  @ApiProperty()
  createdAt: Date;
}

export class VoucherQuestionChoiceCreateDto
  implements Partial<VoucherQuestionChoice>
{
  @ApiProperty()
  @MaxLength(255)
  choice: string;

  @ApiProperty({
    required: false,
  })
  isCorrect: boolean | null;
}

export class VoucherQuestionChoiceUpdateDto
  implements Partial<VoucherQuestionChoiceCreateDto>
{
  @ApiProperty({
    required: false,
  })
  @MaxLength(255)
  choice: string;

  @ApiProperty({
    required: false,
  })
  isCorrect: boolean | null;

  @ApiProperty({
    required: false,
  })
  isDeleted: boolean | null;
}

export class VoucherQuestionDto implements VoucherQuestion {
  @ApiProperty()
  id: number;

  @ApiProperty()
  question: string;

  @ApiProperty({
    enum: VoucherQuestionTypeEnum,
  })
  type: VoucherQuestionType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    required: false,
  })
  campaignId: number | null;

  @ApiProperty({
    required: false,
  })
  discountId: number | null;

  @ApiProperty({
    required: false,
  })
  isDeleted: boolean | null;

  @ApiProperty({
    type: [VoucherQuestionChoiceCreateDto],
  })
  voucherQuestionChoices?: VoucherQuestionChoiceCreateDto[];
}

export class VoucherQuestionCreateDto implements Partial<VoucherQuestionDto> {
  @ApiProperty()
  @MaxLength(255)
  question: string;

  @ApiProperty({
    enum: VoucherQuestionTypeEnum,
  })
  type: VoucherQuestionType;

  @ApiProperty({
    type: [VoucherQuestionChoiceCreateDto],
  })
  @Validate(RequiredIfValueValidator, [
    'type',
    VoucherQuestionTypeEnum.MULTIPLE_CHOICE,
  ])
  @Validate(RequiredIfValueValidator, [
    'type',
    VoucherQuestionTypeEnum.SINGLE_CHOICE,
  ])
  choices?: VoucherQuestionChoiceCreateDto[];
}

export class VoucherQuestionUpdateDto implements Partial<VoucherQuestionDto> {
  @ApiProperty({
    required: false,
  })
  @MaxLength(255)
  question?: string;

  @ApiProperty({
    required: false,
  })
  type?: VoucherQuestionTypeEnum;

  @ApiProperty({
    required: false,
  })
  isDeleted?: boolean;
}

export class VoucherQuestionsListQueryDto {
  @ApiProperty({
    required: false,
  })
  @TransformNumber()
  campaignId?: number;

  @ApiProperty({
    required: false,
  })
  @TransformNumber()
  discountId?: number;
}
