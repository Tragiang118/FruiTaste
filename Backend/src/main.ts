import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  
  // Tăng giới hạn payload để xử lý ảnh base64 lớn (Fix lỗi 413)
  const express = require('express');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Mở CORS và cấu hình bảo mật cơ bản
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ], // URL của Frontend Next.js
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Cho phép đính kèm cookie/token
  });

  // Tùy chọn: Thêm tiền tố api, ví dụ: http://localhost:8080/api/users
  app.setGlobalPrefix('api');

  await app.listen(8000); // Đổi port backend sang 8000 để tránh trùng Next.js
}
bootstrap();
