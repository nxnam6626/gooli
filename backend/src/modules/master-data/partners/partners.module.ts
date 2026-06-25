import { Module } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { PartnersController } from './partners.controller';
import { PartnerGroupsController } from './partner-groups.controller';
import { PartnerGroupsService } from './partner-groups.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PartnersController, PartnerGroupsController],
  providers: [PartnersService, PartnerGroupsService],
  exports: [PartnersService, PartnerGroupsService],
})
export class PartnersModule {}
