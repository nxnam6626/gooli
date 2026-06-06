import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { WebhookModule } from './webhook/webhook.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { ExportsModule } from './exports/exports.module';
import { LocationsModule } from './locations/locations.module';
import { PartnersModule } from './partners/partners.module';
import { ProjectsModule } from './projects/projects.module';
import { ConsultationsModule } from './consultations/consultations.module';

@Module({
  imports: [
    // Load biến môi trường từ .env
    ConfigModule.forRoot({
      isGlobal: true,
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
    WebhookModule,
    ReceiptsModule,
    ExportsModule,
    LocationsModule,
    PartnersModule,
    ProjectsModule,
    ConsultationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
