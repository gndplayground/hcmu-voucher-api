import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Role as PRole, User, UserProfile } from '@prisma/client';
import { Exclude } from 'class-transformer';

export type Role = PRole;

export class UserProfileDto implements UserProfile {
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
  companyId: number | null;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  createdAt: Date;
}

export class UserProfileCreateDto implements Partial<UserProfile> {
  @IsOptional()
  @MaxLength(128)
  @ApiProperty()
  name?: string;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  phone?: string | null;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    required: false,
  })
  companyId?: number;
}

export class UserProfileUpdateDto implements Partial<UserProfile> {
  @IsOptional()
  @MaxLength(128)
  @ApiProperty({
    required: false,
  })
  name?: string;

  @IsOptional()
  @MaxLength(16)
  @ApiProperty({
    required: false,
  })
  phone?: string | null;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  companyId: number | null;
}

export class UserDto implements User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: Role;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  createdAt: Date;

  userProfile?: UserProfileDto;

  @Exclude()
  password: string;

  seed: string;

  @ApiProperty({
    required: false,
  })
  isDisabled: boolean;

  @ApiProperty({
    required: false,
  })
  isLocked: boolean;
}

export class UserCreateDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  role: Role;
}

export class UserEditDto {
  @ApiProperty({
    required: false,
  })
  password?: string;

  @ApiProperty({
    required: false,
  })
  role?: Role;

  @ApiProperty({
    required: false,
  })
  isDisabled?: boolean;

  @ApiProperty({
    required: false,
  })
  isBlocked?: boolean;

  @ApiProperty({
    required: false,
  })
  profile?: UserProfileUpdateDto;
}

export class UserHideSensitiveDto implements Omit<User, 'password' | 'seed'> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: Role;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  createdAt: Date;

  userProfile?: UserProfileDto;

  @ApiProperty({
    required: false,
  })
  isDisabled: boolean;

  @ApiProperty({
    required: false,
  })
  isLocked: boolean;
}
