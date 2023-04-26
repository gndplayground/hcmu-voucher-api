import * as bcrypt from 'bcrypt';

import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';

import { UserDto } from './user.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async list(options: { page: number; limit: number }): Promise<UserDto[]> {
    const { limit, page } = options;
    return this.prisma.user.findMany({
      skip: Math.max(page - 1, 0) * limit,
      take: limit,
      select: {
        createdAt: true,
        email: true,
        id: true,
        role: true,
      },
    });
  }

  async create(user: {
    email: string;
    password: string;
    role: Role;
  }): Promise<UserDto> {
    const hash = await bcrypt.hash(user.password, 10);
    return await this.prisma.user.create({
      data: {
        email: user.email,
        role: user.role,
        password: hash,
      },
    });
  }
}
