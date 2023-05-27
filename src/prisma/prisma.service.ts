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
    cb: (
      ctx: AsyncLocalStorage<any>,
      prisma: Omit<
        PrismaClient,
        '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
      >,
    ) => Promise<T>,
    asOuter?: AsyncLocalStorage<any>,
  ): Promise<T> {
    if (asOuter) {
      const data = asOuter ? asOuter.getStore() : undefined;
      if (data?.tx) {
        return await cb(asOuter, data.tx);
      }
    }

    return await this.$transaction(async (tx) => {
      const asyncLocalStorage = new AsyncLocalStorage();
      return await asyncLocalStorage.run({ tx, test: 'test' }, async () => {
        return await cb(asyncLocalStorage, tx);
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
    debug?: string,
  ): PrismaService {
    const data = asyncLocalStorage ? asyncLocalStorage.getStore() : undefined;

    if (debug) {
      console.log(data?.tx ? 'have tx' : 'no tx');
      console.log('Debug: ', debug);
    }
    return data?.tx || fallback;
  }
}
