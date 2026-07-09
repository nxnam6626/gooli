import { Module } from '@nestjs/common';
import { SlipsService } from './slips.service';
import { SlipsController } from './slips.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { FinanceController } from '../finance.controller';
import { FinanceService } from '../finance.service';

@Module({
  imports: [PrismaModule],
  controllers: [SlipsController, FinanceController],
  providers: [SlipsService, FinanceService],
  exports: [SlipsService],
})
export class SlipsModule {}
