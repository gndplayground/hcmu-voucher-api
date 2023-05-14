import { ApiProperty } from '@nestjs/swagger';
import { Store } from '@prisma/client';
import { MaxLength } from 'class-validator';
import { TransformNumber } from '@/common/transforms';

export class StoreDto implements Store {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({
    required: false,
  })
  latitude: number | null;

  @ApiProperty({
    required: false,
  })
  longitude: number | null;

  @ApiProperty({
    required: false,
  })
  phone: string | null;

  @ApiProperty({
    required: false,
  })
  address: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    required: false,
  })
  openAt: string | null;

  @ApiProperty({
    required: false,
  })
  closeAt: string | null;

  @ApiProperty()
  companyId: number;

  @ApiProperty({
    required: false,
  })
  isDeleted: boolean | null;
}

export class StoreCreateDto implements Partial<Store> {
  @ApiProperty()
  @MaxLength(128)
  name: string;

  @ApiProperty({
    required: false,
  })
  latitude: number | null;

  @ApiProperty({
    required: false,
  })
  longitude: number | null;

  @ApiProperty({
    required: false,
  })
  @MaxLength(15)
  phone: string | null;

  @ApiProperty({
    required: false,
  })
  @MaxLength(128)
  address: string | null;

  @ApiProperty({
    required: false,
  })
  @MaxLength(20)
  openAt: string | null;

  @ApiProperty({
    required: false,
  })
  @MaxLength(20)
  closeAt: string | null;
}

export class StoreUpdateDto implements Partial<Store> {
  @ApiProperty({
    required: false,
  })
  @MaxLength(128)
  name?: string;

  @ApiProperty({
    required: false,
  })
  latitude?: number | null;

  @ApiProperty({
    required: false,
  })
  longitude?: number | null;

  @ApiProperty({
    required: false,
  })
  @MaxLength(15)
  phone?: string | null;

  @ApiProperty({
    required: false,
  })
  @MaxLength(128)
  address?: string | null;

  @ApiProperty({
    required: false,
  })
  @MaxLength(20)
  openAt?: string | null;

  @ApiProperty({
    required: false,
  })
  @MaxLength(20)
  closeAt?: string | null;

  @ApiProperty({
    required: false,
  })
  isDeleted?: boolean | null;
}

export class StoresListQueryDto {
  @ApiProperty()
  @TransformNumber()
  companyId: number;
}
