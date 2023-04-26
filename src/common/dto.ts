import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class APIResponseDto<T> {
  @ApiProperty()
  data: T;
}

export class PaginationDto {
  @Transform((value) => parseInt(value.value))
  @IsInt()
  @IsOptional()
  page?: number;

  @Transform((value) => parseInt(value.value))
  @IsIn([10, 20, 50, 100])
  @IsOptional()
  limit?: number;
}
