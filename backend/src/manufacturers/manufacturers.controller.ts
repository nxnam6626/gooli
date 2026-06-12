import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ManufacturersService } from './manufacturers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('manufacturers')
@UseGuards(JwtAuthGuard)
export class ManufacturersController {
  constructor(private readonly service: ManufacturersService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Post()
  @UseGuards(RolesGuard) @Roles(UserRole.ADMIN)
  create(@Body() body: { code: string; name: string }) { return this.service.create(body); }

  @Patch(':id')
  @UseGuards(RolesGuard) @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: { code?: string; name?: string }) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
