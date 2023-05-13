import { ApiProperty } from '@nestjs/swagger';
import {
  VoucherDiscount,
  VoucherDiscountType as baseType,
  VoucherClaimType as baseClaimType,
  VoucherCodeType as baseVoucherCodeType,
} from '@prisma/client';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { TransformNumber } from '@/common/transforms';

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
  createdAt: Date;
}

export class VoucherDiscountCreateWithCampaignDto
  implements Partial<VoucherDiscount>
{
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @MaxLength(255)
  description: string | null;

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
  claimType: VoucherClaimType | null;

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
  description: string | null;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(VoucherDiscountTypeEnum))
  type: VoucherDiscountType;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(VoucherClaimTypeEnum))
  claimType: VoucherClaimType | null;

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
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(VoucherCodeTypeEnum))
  codeType: VoucherCodeType;

  @ApiProperty({
    required: false,
  })
  @TransformNumber()
  @IsOptional()
  @IsNumber()
  discount: number;

  @ApiProperty({
    required: false,
  })
  @TransformNumber()
  @IsOptional()
  @IsNumber()
  total: number;
}
