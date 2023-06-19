import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { CompaniesController } from './companies/companies.controller';
import { StatsController } from './stats/stats.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';
import { JwtStrategy } from '@/auth/jwt.strategy';
import { CompaniesModule } from '@/companies/companies.module';
import { UploadModule } from '@/upload/upload.module';
import { CampaignsModule } from '@/campaigns/campaigns.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    PrismaModule,
    ConfigModule,
    CompaniesModule,
    UploadModule,
    CampaignsModule,
  ],
  controllers: [UserController, CompaniesController, StatsController],
  providers: [JwtStrategy],
})
export class AdminModule {}
