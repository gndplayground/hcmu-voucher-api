import { ApiProperty } from '@nestjs/swagger';
import { Company } from '@prisma/client';
import { IsNotEmpty, MaxLength, IsBoolean, IsOptional } from 'class-validator';
import { TransformBoolean } from '@/common/transforms';
import { PaginationDto } from '@/common/dto';

export class CompanyDto implements Company {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({
    required: false,
  })
  phone: string | null;

  @ApiProperty({
    required: false,
  })
  address: string | null;

  @ApiProperty({
    required: false,
  })
  website: string | null;

  @ApiProperty({
    required: false,
  })
  logo: string | null;

  @ApiProperty({
    required: false,
  })
  createdAt: Date;

  @IsBoolean()
  @ApiProperty({
    required: false,
  })
  isDeleted: boolean;

  @IsBoolean()
  @ApiProperty({
    required: false,
  })
  isDisabled: boolean;
}

export class CompanyCreateDto implements Partial<Company> {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @ApiProperty({
    required: false,
  })
  @MaxLength(16)
  phone: string | null;

  @ApiProperty({
    required: false,
  })
  @MaxLength(256)
  address: string | null;

  @ApiProperty({
    required: false,
    type: 'string',
    format: 'binary',
  })
  logo: string | null;

  @ApiProperty({
    required: false,
  })
  @MaxLength(256)
  website: string | null;
}

export class CompanyAdminUpdateDto implements Partial<Company> {
  @ApiProperty({
    required: false,
  })
  @MaxLength(128)
  @IsOptional()
  name?: string;

  @ApiProperty({
    required: false,
  })
  @MaxLength(16)
  @IsOptional()
  phone?: string | null;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @MaxLength(256)
  address?: string | null;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @MaxLength(256)
  website?: string | null;

  @IsOptional()
  @ApiProperty({
    required: false,
    type: 'string',
    format: 'binary',
  })
  logo: string | null;

  @TransformBoolean()
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    required: false,
  })
  isDeleted?: boolean;

  @TransformBoolean()
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    required: false,
  })
  isDisabled?: boolean;

  @TransformBoolean()
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    required: false,
  })
  shouldDeletePhoto?: boolean;
}

export class CompanyUpdateDto implements Partial<Company> {
  @ApiProperty({
    required: false,
  })
  @MaxLength(128)
  @IsOptional()
  name?: string;

  @ApiProperty({
    required: false,
  })
  @MaxLength(16)
  @IsOptional()
  phone?: string | null;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @MaxLength(256)
  address?: string | null;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @MaxLength(256)
  website?: string | null;

  @IsOptional()
  @ApiProperty({
    required: false,
    type: 'string',
    format: 'binary',
  })
  logo: string | null;

  @TransformBoolean()
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    required: false,
  })
  shouldDeletePhoto?: boolean;
}

export class CompanyListOptionsDto extends PaginationDto {
  @TransformBoolean()
  @IsOptional()
  isHaveActiveCampaigns?: boolean;

  @TransformBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
