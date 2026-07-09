import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('debt-summary')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getDebtSummary() {
    return this.financeService.getDebtSummary();
  }

  @Get('ledger/:partnerId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getPartnerLedger(@Param('partnerId', ParseIntPipe) partnerId: number) {
    return this.financeService.getPartnerLedger(partnerId);
  }

  @Get('cashbook')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getCashbook(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('method') method?: string,
  ) {
    return this.financeService.getCashbook({ from, to, method });
  }

  @Get('pnl')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getProfitAndLoss(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.financeService.getProfitAndLoss({ from, to });
  }
}
