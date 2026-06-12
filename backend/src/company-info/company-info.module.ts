import { Module } from '@nestjs/common';
import { CompanyInfoController } from './company-info.controller';
import { CompanyInfoService } from './company-info.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyInfoController],
  providers: [CompanyInfoService],
})
export class CompanyInfoModule {}
