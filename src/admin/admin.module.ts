import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaService } from '@/prisma/prisma.service';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [UserModule, PrismaModule],
  controllers: [UserController],
  providers: [PrismaService],
})
export class AdminModule {}
