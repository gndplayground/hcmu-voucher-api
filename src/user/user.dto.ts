import { ApiProperty } from '@nestjs/swagger';
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
  company: string | null;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  createdAt: Date;
}

export class UserDto implements Omit<User, 'password'> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: Role;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  userProfile?: UserProfileDto;
}
