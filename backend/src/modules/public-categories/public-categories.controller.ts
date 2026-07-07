import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  PublicCategoriesService,
  TreeCategoryData,
} from './public-categories.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('public-categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: PublicCategoriesService) {}

  @Get()
  getTree() {
    return this.categoriesService.getTree();
  }

  @Get('popular')
  getPopular() {
    return this.categoriesService.getPopularCategories();
  }

  @UseGuards(ThrottlerGuard)
  @Post('view')
  incrementView(@Body('href') href: string) {
    return this.categoriesService.incrementView(href);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  saveTree(@Body() categories: TreeCategoryData[]) {
    return this.categoriesService.saveTree(categories);
  }
}
