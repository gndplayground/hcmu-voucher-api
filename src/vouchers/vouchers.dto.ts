import { ApiProperty } from '@nestjs/swagger';
import {
  VoucherDiscount,
  VoucherDiscountType as baseType,
  VoucherClaimType as baseClaimType,
  VoucherCodeType as baseVoucherCodeType,
  VoucherTicket,
} from '@prisma/client';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Optional } from '@nestjs/common';
import { TransformNumber } from '@/common/transforms';
import {
  VoucherQuestionCreateDto,
  VoucherQuestionUpdateWithCampaignDto,
} from '@/voucher-questions/voucher-questions.dto';
import { RequiredIfValueValidator } from '@/common/validators';
import { PaginationDto } from '@/common/dto';
import { CampaignProgressEnum } from '@/campaigns/campaigns.dto';

export type VoucherDiscountType = (typeof baseType)[keyof typeof baseType];
export type VoucherClaimType =
  (typeof baseClaimType)[keyof typeof baseClaimType];
export type VoucherCodeType =
  (typeof baseVoucherCodeType)[keyof typeof baseVoucherCodeType];

export enum VoucherDiscountTypeEnum {
  PERCENTAGE = 'PERCENTAGE',
  AMOUNT = 'AMOUNT',
}

export enum VoucherClaimTypeEnum {
  FASTEST = 'FASTEST',
  QUESTIONS = 'QUESTIONS',
}

export enum VoucherCodeTypeEnum {
  CLAIM = 'CLAIM',
  MANUAL = 'MANUAL',
}

export class VoucherTicketDto implements VoucherTicket {
  @ApiProperty()
  id: number;

  @ApiProperty()
  discountId: number;

  @ApiProperty({
    required: false,
  })
  code: string | null;

  @ApiProperty({
    required: false,
  })
  isUsed: boolean;

  @ApiProperty()
  claimBy: number;

  @ApiProperty()
  claimAt: Date;

  @ApiProperty({
    required: false,
  })
  ownedBy: number | null;
}

export class VoucherDiscountDto implements VoucherDiscount {
  @ApiProperty()
  id: number;

  @ApiProperty()
  campaignId: number;

  @ApiProperty({
    required: false,
  })
  description: string | null;

  @ApiProperty()
  @ApiProperty({
    required: true,
    enum: VoucherDiscountTypeEnum,
  })
  type: VoucherDiscountType;

  @ApiProperty({
    required: false,
    enum: VoucherClaimTypeEnum,
  })
  @IsOptional()
  claimType: VoucherClaimType | null;

  @ApiProperty({
    required: false,
  })
  claimMode: number | null;

  @ApiProperty({
    required: false,
  })
  code: string | null;

  @ApiProperty({
    readOnly: false,
    enum: VoucherCodeTypeEnum,
  })
  @IsOptional()
  codeType: VoucherCodeType;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  claimed: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    required: false,
    type: [VoucherTicketDto],
  })
  voucherTickets?: VoucherTicketDto[];

  @ApiProperty({
    required: false,
    type: [VoucherQuestionCreateDto],
  })
  @ValidateNested()
  @Validate(RequiredIfValueValidator, [
    'claimType',
    VoucherClaimTypeEnum.QUESTIONS,
  ])
  @Type(() => VoucherQuestionCreateDto)
  questions?: VoucherQuestionCreateDto[];

  @ApiProperty({
    required: false,
  })
  isDeleted: boolean | null;
}

export class VoucherDiscountCreateWithCampaignDto
  implements Partial<VoucherDiscount>
{
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @MaxLength(255)
  description?: string | null;

  @ApiProperty({
    enum: VoucherDiscountTypeEnum,
  })
  @IsNotEmpty()
  @IsIn(Object.values(VoucherDiscountTypeEnum))
  type: VoucherDiscountType;

  @ApiProperty({
    required: false,
    enum: VoucherClaimTypeEnum,
  })
  @IsOptional()
  @IsIn(Object.values(VoucherClaimTypeEnum))
  claimType?: VoucherClaimType | null;

  @ApiProperty({
    required: false,
  })
  @TransformNumber()
  @IsOptional()
  @IsNumber()
  claimMode: number | null;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  code: string | null;

  @ApiProperty({
    enum: VoucherCodeTypeEnum,
  })
  @IsOptional()
  @IsIn(Object.values(VoucherCodeTypeEnum))
  codeType: VoucherCodeType;

  @ApiProperty()
  @TransformNumber()
  @IsNotEmpty()
  @IsNumber()
  discount: number;

  @ApiProperty()
  @TransformNumber()
  @IsNotEmpty()
  @IsNumber()
  total: number;

  @ApiProperty({
    required: false,
    type: [VoucherQuestionCreateDto],
  })
  @Validate(RequiredIfValueValidator, [
    'claimType',
    VoucherClaimTypeEnum.QUESTIONS,
  ])
  @ValidateNested()
  @Type(() => VoucherQuestionCreateDto)
  questions?: VoucherQuestionCreateDto[];
}

export class VoucherDiscountUpdateWithCampaignDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  id?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  isDeleted?: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @MaxLength(255)
  description?: string | null;

  @ApiProperty({
    enum: VoucherDiscountTypeEnum,
  })
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(VoucherDiscountTypeEnum))
  type?: VoucherDiscountType;

  @ApiProperty({
    required: false,
    enum: VoucherClaimTypeEnum,
  })
  @IsOptional()
  @IsIn(Object.values(VoucherClaimTypeEnum))
  claimType?: VoucherClaimType | null;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @TransformNumber()
  @IsNumber()
  claimMode?: number | null;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  code?: string | null;

  @ApiProperty({
    enum: VoucherCodeTypeEnum,
  })
  @IsOptional()
  @IsIn(Object.values(VoucherCodeTypeEnum))
  codeType?: VoucherCodeType;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @TransformNumber()
  @IsNotEmpty()
  @IsNumber()
  discount?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @TransformNumber()
  @IsNotEmpty()
  @IsNumber()
  total: number;

  @ApiProperty({
    required: false,
    type: [VoucherQuestionUpdateWithCampaignDto],
  })
  @Validate(RequiredIfValueValidator, [
    'claimType',
    VoucherClaimTypeEnum.QUESTIONS,
  ])
  @ValidateNested()
  @Type(() => VoucherQuestionUpdateWithCampaignDto)
  @Optional()
  questions: VoucherQuestionUpdateWithCampaignDto[];
}

export class VoucherDiscountCreateDto extends VoucherDiscountCreateWithCampaignDto {
  @ApiProperty()
  @IsNotEmpty()
  campaignId: number;
}

export class VoucherDiscountUpdateDto implements Partial<VoucherDiscount> {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @MaxLength(255)
  description?: string | null;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(VoucherDiscountTypeEnum))
  type?: VoucherDiscountType;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(VoucherClaimTypeEnum))
  claimType?: VoucherClaimType | null;

  @ApiProperty({
    required: false,
  })
  @TransformNumber()
  @IsOptional()
  @IsNumber()
  claimMode?: number | null;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  code?: string | null;

  @ApiProperty({
    enum: VoucherCodeTypeEnum,
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(VoucherCodeTypeEnum))
  codeType?: VoucherCodeType;

  @ApiProperty({
    required: false,
  })
  @TransformNumber()
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({
    required: false,
  })
  @TransformNumber()
  @IsOptional()
  @IsNumber()
  total?: number;

  @ApiProperty({
    required: false,
  })
  @TransformNumber()
  @IsOptional()
  @IsNumber()
  claimed?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  isDeleted?: boolean;
}

export class VoucherTicketCreateDto implements Partial<VoucherTicket> {
  @ApiProperty()
  discountId: number;

  @ApiProperty({
    required: false,
  })
  code?: string | null;

  @ApiProperty()
  claimBy: number;
}

export class VouchersnListQueryDto extends PaginationDto {
  @IsOptional()
  filterByProgress?: CampaignProgressEnum;

  @TransformNumber()
  @IsOptional()
  @IsNumber()
  companyId?: number;
}
