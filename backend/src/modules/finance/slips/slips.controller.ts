import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { SlipsService } from './slips.service';
import { CreateSlipDto } from './dto/create-slip.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

interface RequestWithUser {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

@Controller('slips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SlipsController {
  constructor(private readonly slipsService: SlipsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  create(
    @Body() createSlipDto: CreateSlipDto,
    @Request() req: RequestWithUser,
  ) {
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

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.slipsService.remove(id, req.user);
  }
}
