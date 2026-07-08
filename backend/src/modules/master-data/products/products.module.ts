import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';
import { SkuGeneratorService } from './sku-generator.service';

@Module({
  imports: [PrismaModule, AuthModule, CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService, SkuGeneratorService],
  exports: [ProductsService, SkuGeneratorService],
})
export class ProductsModule {}
