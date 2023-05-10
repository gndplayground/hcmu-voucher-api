import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  providers: [CompaniesService, PrismaService],
  exports: [CompaniesService],
  imports: [PrismaModule],
  controllers: [CompaniesController],
})
export class CompaniesModule {}
