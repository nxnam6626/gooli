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
import { SlipsService } from './slips.service';
import { CreateSlipDto } from './dto/create-slip.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('slips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SlipsController {
  constructor(private readonly slipsService: SlipsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  create(@Body() createSlipDto: CreateSlipDto, @Request() req) {
    return this.slipsService.create(createSlipDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAll() {
    return this.slipsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.slipsService.findOne(id);
  }
}
