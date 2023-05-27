import { ApiProperty } from '@nestjs/swagger';
import { Campaign } from '@prisma/client';
import {
  IsNotEmpty,
  MaxLength,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsIn,
  Validate,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  VoucherClaimType,
  VoucherClaimTypeEnum,
  VoucherDiscountCreateWithCampaignDto,
  VoucherDiscountDto,
  VoucherDiscountUpdateWithCampaignDto,
} from '@/vouchers/vouchers.dto';
import { TransformBoolean, TransformNumber } from '@/common/transforms';
import {
  LessThanValidator,
  NotPastValidator,
  RequiredIfValidator,
  RequiredIfValueValidator,
} from '@/common/validators';
import { PaginationDto } from '@/common/dto';
import {
  VoucherQuestionCreateDto,
  VoucherQuestionUpdateWithCampaignDto,
} from '@/voucher-questions/voucher-questions.dto';

export class CampaignDto implements Campaign {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({
    required: false,
  })
  description: string | null;

  @ApiProperty({
    required: false,
  })
  logo: string | null;

  @ApiProperty({
    required: false,
    enum: VoucherClaimTypeEnum,
  })
  @IsIn(Object.values(VoucherClaimTypeEnum))
  claimType: VoucherClaimType | null;

  @ApiProperty({
    required: false,
  })
  claimMode: number | null;

  @ApiProperty({
    required: false,
  })
  isDeleted: boolean | null;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  createdBy: number;

  @ApiProperty()
  companyId: number;

  @ApiProperty({
    required: false,
    type: [VoucherDiscountDto],
  })
  voucherDiscounts?: VoucherDiscountDto[];
}

export class CampaignCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @MaxLength(256)
  description?: string | null;

  @IsOptional()
  @ApiProperty({
    required: false,
    type: 'string',
    format: 'binary',
  })
  logo: string | null;

  @ApiProperty({
    required: false,
    enum: VoucherClaimTypeEnum,
  })
  @IsOptional()
  @IsIn(Object.values(VoucherClaimTypeEnum))
  claimType: VoucherClaimType | null;

  @TransformNumber()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  claimMode: number | null;

  @IsNotEmpty()
  @Validate(NotPastValidator)
  @Validate(LessThanValidator, ['endDate'])
  @IsDateString()
  @ApiProperty()
  startDate: Date;

  @IsNotEmpty()
  @Validate(NotPastValidator)
  @IsDateString()
  @ApiProperty()
  endDate: Date;
}

export class CampaignCreateFullDto extends CampaignCreateDto {
  @ApiProperty({
    type: [VoucherDiscountCreateWithCampaignDto],
  })
  @ValidateNested()
  @Type(() => VoucherDiscountCreateWithCampaignDto)
  @IsNotEmpty()
  voucherDiscounts: VoucherDiscountCreateWithCampaignDto[];

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

export class CampaignUpdateDto implements Partial<Campaign> {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @MaxLength(256)
  description?: string | null;

  @IsOptional()
  @ApiProperty({
    required: false,
    type: 'string',
    format: 'binary',
  })
  logo: string | null;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  claimType: VoucherClaimType | null;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  claimMode: number | null;

  @IsOptional()
  @IsDateString()
  @Validate(NotPastValidator)
  @Validate(LessThanValidator, ['endDate'])
  @Validate(RequiredIfValidator, ['endDate'])
  @ApiProperty({
    required: false,
  })
  startDate: Date;

  @IsOptional()
  @IsDateString()
  @Validate(NotPastValidator)
  @Validate(RequiredIfValidator, ['startDate'])
  @ApiProperty({
    required: false,
  })
  endDate: Date;

  @TransformBoolean()
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    required: false,
  })
  isDeleted: boolean | null;

  @TransformBoolean()
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    required: false,
  })
  shouldDeletePhoto?: boolean;
}

export class CampaignUpdateFullDto extends CampaignUpdateDto {
  @ApiProperty({
    type: [VoucherDiscountUpdateWithCampaignDto],
  })
  @ValidateNested()
  @Type(() => VoucherDiscountUpdateWithCampaignDto)
  @IsNotEmpty()
  voucherDiscounts: VoucherDiscountUpdateWithCampaignDto[];

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
  questions?: VoucherQuestionUpdateWithCampaignDto[];
}

export enum CampaignProgressEnum {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  FINISHED = 'finished',
}

export class CampaignListQueryDto extends PaginationDto {
  @IsOptional()
  filterByProgress?: CampaignProgressEnum;

  @TransformNumber()
  @IsOptional()
  companyId?: number;
}
