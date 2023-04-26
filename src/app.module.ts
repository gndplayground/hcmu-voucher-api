import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import config from './common/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    PrismaModule,
    UserModule,
    DashboardModule,
    AdminModule,
    RouterModule.register([
      {
        path: 'admin',
        module: AdminModule,
      },
      {
        path: 'dashboard',
        module: DashboardModule,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
