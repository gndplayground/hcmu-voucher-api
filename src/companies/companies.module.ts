import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { UploadModule } from '@/upload/upload.module';

@Module({
  providers: [CompaniesService],
  exports: [CompaniesService],
  imports: [PrismaModule, UploadModule],
  controllers: [CompaniesController],
})
export class CompaniesModule {}
