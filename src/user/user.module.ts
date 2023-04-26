import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
