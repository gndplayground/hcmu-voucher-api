import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';

import {
  UserDto,
  UserEditDto,
  UserHideSensitiveDto,
  UserProfileCreateDto,
  UserProfileDto,
  UserProfileUpdateDto,
} from './user.dto';
import { PrismaService } from '@/prisma/prisma.service';

// write a function random string max length 6
function randomString() {
  return Math.random().toString(36).substring(2, 8);
}

const HIDE_SENSITIVE_FIELDS = {
  createdAt: true,
  email: true,
  id: true,
  role: true,
  isDisabled: true,
  isLocked: true,
};

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async list(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<UserHideSensitiveDto[]> {
    const { limit, page } = options;
    return this.prisma.user.findMany({
      skip: Math.max(page - 1, 0) * limit,
      take: limit,
      select: HIDE_SENSITIVE_FIELDS,
      where: {
        email: {
          contains: options.search,
        },
      },
      orderBy: {
        createdAt: 'desc',
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

  async findOne<B extends boolean = false>(query: {
    email?: string;
    id?: number;
    hideSensitive?: B;
  }): Promise<B extends true ? UserHideSensitiveDto : UserDto | undefined> {
    const { email, id, hideSensitive } = query;
    const u: UserDto | UserHideSensitiveDto = await this.prisma.user.findUnique(
      {
        where: {
          id,
          email,
        },
        select: !hideSensitive ? undefined : HIDE_SENSITIVE_FIELDS,
      },
    );
    return u as any;
  }

  async update(
    options: {
      id: number;
      data: UserEditDto;
    },
    as?: AsyncLocalStorage<any>,
  ): Promise<UserHideSensitiveDto | undefined> {
    const { id, data } = options;
    const { profile, ...rest } = data;

    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const user = await this.findOne({ id, hideSensitive: true });

    if (!user) {
      return undefined;
    }

    return await p.transactionLocal(async (prisma) => {
      const user = await prisma.user.update({
        where: {
          id,
        },
        data: {
          ...rest,
          seed:
            data.isBlocked || data.isDisabled || data.password || data.role
              ? randomString()
              : undefined,
        },
        select: HIDE_SENSITIVE_FIELDS,
      });
      if (profile) {
        await prisma.userProfile.upsert({
          where: {
            userId: user.id,
          },
          update: {
            ...profile,
            userId: user.id,
          },
          create: {
            ...profile,
            userId: user.id,
          },
        });
      }
      return user;
    }, as);
  }

  async createProfile(
    data: {
      data: UserProfileCreateDto;
      userId: number;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    await p.userProfile.create({
      data: {
        ...data.data,
        userId: data.userId,
      },
    });
  }

  async updateProfile(
    data: {
      data: UserProfileUpdateDto;
      userId?: number;
      id?: number;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    await p.userProfile.update({
      where: {
        userId: data.userId,
        id: data.id,
      },
      data: {
        ...data.data,
      },
    });
  }

  async findOneProfile(
    query: { id?: number; userId?: number },
    as?: AsyncLocalStorage<any>,
  ): Promise<UserProfileDto> {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    return p.userProfile.findUnique({
      where: {
        id: query.id,
        userId: query.userId,
      },
    });
  }
}
