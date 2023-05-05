import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaService } from '@/prisma/prisma.service';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';
import { JwtStrategy } from '@/auth/jwt.strategy';

@Module({
  imports: [UserModule, AuthModule, PrismaModule, ConfigModule],
  controllers: [UserController],
  providers: [PrismaService, JwtStrategy],
})
export class AdminModule {}
