import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { json, urlencoded } from 'express';

async function bootstrap() {
  // Tắt body parser mặc định để cấu hình thủ công với giới hạn lớn hơn (cho phép tải lên ảnh base64)
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Bảo mật HTTP headers
  app.use(helmet());

  // Cho phép CORS từ frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Tự động validate và transform request body qua DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các field không khai báo trong DTO
      forbidNonWhitelisted: true,
      transform: true, // Tự động convert type (string -> number, v.v.)
    }),
  );

  // Prefix API
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Gooli API running on: http://localhost:${port}/api/v1`);
}

bootstrap();

