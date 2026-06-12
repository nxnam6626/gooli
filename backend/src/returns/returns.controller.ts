import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('returns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post('customer')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  createCustomerReturn(@Body() dto: CreateReturnDto, @Request() req) {
    return this.returnsService.createCustomerReturn(dto, req.user.id);
  }

  @Post('supplier')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  createSupplierReturn(@Body() dto: CreateReturnDto, @Request() req) {
    return this.returnsService.createSupplierReturn(dto, req.user.id);
  }

  @Get('customer')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAllCustomerReturns() {
    return this.returnsService.findAllCustomerReturns();
  }

  @Get('supplier')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAllSupplierReturns() {
    return this.returnsService.findAllSupplierReturns();
  }

  @Get('customer/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findCustomerReturnById(@Param('id', ParseIntPipe) id: number) {
    return this.returnsService.findCustomerReturnById(id);
  }

  @Get('supplier/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findSupplierReturnById(@Param('id', ParseIntPipe) id: number) {
    return this.returnsService.findSupplierReturnById(id);
  }
}
