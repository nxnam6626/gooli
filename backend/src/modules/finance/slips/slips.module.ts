import { Module } from '@nestjs/common';
import { SlipsService } from './slips.service';
import { SlipsController } from './slips.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SlipsController],
  providers: [SlipsService],
  exports: [SlipsService],
})
export class SlipsModule {}
