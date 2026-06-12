import { Module } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { ReturnsController } from './returns.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WebhookModule } from '../webhook/webhook.module';

@Module({
  imports: [PrismaModule, WebhookModule],
  controllers: [ReturnsController],
  providers: [ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
