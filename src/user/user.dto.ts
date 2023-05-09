import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Role as PRole, User, UserProfile } from '@prisma/client';

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
