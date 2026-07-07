import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { ReceiptCodeGeneratorService } from './services/receipt-code-generator.service';
import { StockUpdaterService } from './services/stock-updater.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ReceiptsController],
  providers: [ReceiptsService, ReceiptCodeGeneratorService, StockUpdaterService],
  exports: [ReceiptsService, ReceiptCodeGeneratorService, StockUpdaterService],
})
export class ReceiptsModule {}
