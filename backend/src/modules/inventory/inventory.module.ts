import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { StockUpdaterService } from './services/stock-updater.service';
import { ReceiptCodeGeneratorService } from './services/receipt-code-generator.service';
import { ExportCodeGeneratorService } from './services/export-code-generator.service';

@Module({
  imports: [PrismaModule],
  providers: [
    StockUpdaterService,
    ReceiptCodeGeneratorService,
    ExportCodeGeneratorService,
  ],
  exports: [
    StockUpdaterService,
    ReceiptCodeGeneratorService,
    ExportCodeGeneratorService,
  ],
})
export class InventoryModule {}
