import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { CompanyInfoService } from './company-info.service';
import { UpsertCompanyInfoDto } from './dto/upsert-company-info.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('company-info')
export class CompanyInfoController {
  constructor(private readonly service: CompanyInfoService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  get() {
    return this.service.get();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  upsert(@Body() dto: UpsertCompanyInfoDto) {
    return this.service.upsert(dto);
  }
}
