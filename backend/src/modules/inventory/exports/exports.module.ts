import { Module } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { ReceiptsModule } from '../receipts/receipts.module';
import { ExportCodeGeneratorService } from './services/export-code-generator.service';

@Module({
  imports: [PrismaModule, AuthModule, ReceiptsModule],
  controllers: [ExportsController],
  providers: [ExportsService, ExportCodeGeneratorService],
  exports: [ExportsService, ExportCodeGeneratorService],
})
export class ExportsModule {}
