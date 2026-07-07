import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { ReceiptCodeGeneratorService } from './services/receipt-code-generator.service';
import { StockUpdaterService } from './services/stock-updater.service';
import { ReceiptExcelImportService } from './services/receipt-excel-import.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ReceiptsController],
  providers: [
    ReceiptsService,
    ReceiptCodeGeneratorService,
    StockUpdaterService,
    ReceiptExcelImportService,
  ],
  // Export sub-services so other modules (e.g. ExportsModule) can reuse
  // StockUpdaterService without re-declaring it
  exports: [ReceiptsService, ReceiptCodeGeneratorService, StockUpdaterService],
})
export class ReceiptsModule {}
