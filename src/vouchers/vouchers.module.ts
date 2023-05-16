import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  providers: [VouchersService],
  exports: [VouchersService],
  imports: [PrismaModule],
  controllers: [VouchersController],
})
export class VouchersModule {}
