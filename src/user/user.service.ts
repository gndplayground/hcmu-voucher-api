import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';

import { UserDto } from './user.dto';
import { PrismaService } from '@/prisma/prisma.service';

// write a function random string max length 6
function randomString() {
  return Math.random().toString(36).substring(2, 8);
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async list(options: {
    page: number;
    limit: number;
  }): Promise<Omit<UserDto, 'password' | 'seed'>[]> {
    const { limit, page } = options;
    return this.prisma.user.findMany({
      skip: Math.max(page - 1, 0) * limit,
      take: limit,
      select: {
        createdAt: true,
        email: true,
        id: true,
        role: true,
        isDisabled: true,
        isLocked: true,
      },
    });
  }

  async create(user: {
    email: string;
    password: string;
    role: Role;
  }): Promise<UserDto> {
    return await this.prisma.user.create({
      data: {
        email: user.email,
        role: user.role,
        password: user.password,
        seed: randomString(),
      },
    });
  }

  async updateSeed(id: number) {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        seed: randomString(),
      },
    });
  }

  async findOne(query: { email?: string; id?: number }): Promise<UserDto> {
    const { email, id } = query;
    return await this.prisma.user.findUnique({
      where: {
        id,
        email,
      },
    });
  }
}
