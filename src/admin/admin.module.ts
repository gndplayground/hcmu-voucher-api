import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { CompaniesController } from './companies/companies.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaService } from '@/prisma/prisma.service';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';
import { JwtStrategy } from '@/auth/jwt.strategy';
import { CompaniesModule } from '@/companies/companies.module';
import { UploadModule } from '@/upload/upload.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    PrismaModule,
    ConfigModule,
    CompaniesModule,
    UploadModule,
  ],
  controllers: [UserController, CompaniesController],
  providers: [PrismaService, JwtStrategy],
})
export class AdminModule {}
