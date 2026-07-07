import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { StockUpdaterService } from './services/stock-updater.service';
import { TransactionCodeGeneratorService } from './services/transaction-code-generator.service';

@Module({
  imports: [PrismaModule],
  providers: [StockUpdaterService, TransactionCodeGeneratorService],
  exports: [StockUpdaterService, TransactionCodeGeneratorService],
})
export class InventorySharedModule {}
