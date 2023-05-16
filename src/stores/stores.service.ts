import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { StoreCreateDto, StoreUpdateDto } from './stores.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class StoresService {
  constructor(private readonly prismaService: PrismaService) {}

  async list(options: { companyId: number }, as?: AsyncLocalStorage<any>) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prismaService,
      as,
    );
    return p.store.findMany({
      where: {
        companyId: options.companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    options: { id?: number; data: StoreUpdateDto },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prismaService,
      as,
    );
    return await p.store.update({
      where: {
        id: options.id,
      },
      data: options.data,
    });
  }

  async findOne(
    options: { id?: number; include?: { company?: boolean } } = {},
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prismaService,
      as,
    );
    return await p.store.findUnique({
      where: {
        id: options.id,
      },
      include: {
        company: options.include?.company,
      },
    });
  }

  async create(
    options: { data: StoreCreateDto; companyId: number },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prismaService,
      as,
    );
    return await p.store.create({
      data: {
        ...options.data,
        companyId: options.companyId,
      },
    });
  }
}
