import { AsyncLocalStorage } from 'async_hooks';
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  /**
   * await this.prisma.transaction(async (as) => {
   *  await this.fetch({ page: 1, limit: 10 }, as);
   * });
   */
  async transaction<T>(
    cb: (ctx: AsyncLocalStorage<any>) => Promise<T>,
    asOuter?: AsyncLocalStorage<any>,
  ): Promise<T> {
    if (asOuter) {
      const data = asOuter ? asOuter.getStore() : undefined;
      if (data?.tx) {
        return await cb(asOuter);
      }
    }

    return await this.$transaction(async (tx) => {
      const asyncLocalStorage = new AsyncLocalStorage();
      return await asyncLocalStorage.run({ tx }, async () => {
        return await cb(asyncLocalStorage);
      });
    });
  }

  async transactionLocal<T>(
    cb: (prisma: PrismaService) => Promise<T>,
    asOuter?: AsyncLocalStorage<any>,
  ): Promise<T> {
    if (asOuter) {
      const data = asOuter ? asOuter.getStore() : undefined;
      if (data?.tx) {
        return await cb(data?.tx);
      }
    }

    return await this.$transaction(async (tx) => {
      return await cb(tx as any as PrismaService);
    });
  }

  static getPrismaInstanceFromAsyncLocalStorage(
    fallback: PrismaService,
    asyncLocalStorage?: AsyncLocalStorage<any> | null,
  ): PrismaService {
    const data = asyncLocalStorage ? asyncLocalStorage.getStore() : undefined;
    return data?.tx || fallback;
  }
}
