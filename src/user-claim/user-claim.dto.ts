import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  MaxLength,
  ArrayMinSize,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { TransformNumber } from '@/common/transforms';

export class UserClaimQuestionAnswerDto {
  @ApiProperty()
  @IsNumber({}, { message: 'Value must be a number' })
  questionId: number;

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  @ArrayMinSize(1, { message: 'Array choices must have at least one element' })
  @IsNumber({}, { each: true, message: 'Each element must be a number' })
  choices?: number[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @MaxLength(255)
  answer?: string;
}

export class UserClaimVoucherRequestDto {
  @ApiProperty()
  @IsNumber()
  @Min(1, { message: 'Value must be greater than zero' })
  voucherDiscountId: number;

  @ApiProperty({
    required: false,
    type: [UserClaimQuestionAnswerDto],
  })
  @IsOptional()
  @Type(() => UserClaimQuestionAnswerDto)
  @ValidateNested()
  quenstionAnswers?: UserClaimQuestionAnswerDto[];
}

export class UserCheckClaimVoucherRequestDto {
  @ApiProperty()
  @TransformNumber()
  @IsNumber()
  @Min(1, { message: 'Value must be greater than zero' })
  id: number;
}
