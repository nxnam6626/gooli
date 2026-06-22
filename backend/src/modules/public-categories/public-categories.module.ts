import { Module } from '@nestjs/common';
import { PublicCategoriesService } from './public-categories.service';
import { PublicCategoriesController } from './public-categories.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PublicCategoriesController],
  providers: [PublicCategoriesService],
  exports: [PublicCategoriesService],
})
export class PublicCategoriesModule {}
