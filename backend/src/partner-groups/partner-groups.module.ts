import { Module } from '@nestjs/common';
import { PartnerGroupsController } from './partner-groups.controller';
import { PartnerGroupsService } from './partner-groups.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PartnerGroupsController],
  providers: [PartnerGroupsService],
  exports: [PartnerGroupsService],
})
export class PartnerGroupsModule {}
