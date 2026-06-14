import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/master-data/categories/categories.module';
import { ProductsModule } from './modules/master-data/products/products.module';
import { ReceiptsModule } from './modules/inventory/receipts/receipts.module';
import { ExportsModule } from './modules/inventory/exports/exports.module';
import { PartnersModule } from './modules/master-data/partners/partners.module';
import { SlipsModule } from './modules/finance/slips/slips.module';
import { UnitsModule } from './modules/master-data/units/units.module';

@Module({
  imports: [
    // Load biến môi trường từ .env
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // Rate limiting: tối đa 100 request / 60 giây / IP
    // Giúp bảo vệ Free Tier khỏi bị lạm dụng
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 giây (ms)
        limit: 100,
      },
    ]),

    // Prisma Database Module
    PrismaModule,

    // Gooli Modules
    AuthModule,
    CategoriesModule,
    ProductsModule,
    ReceiptsModule,
    ExportsModule,
    PartnersModule,
    SlipsModule,
    UnitsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
