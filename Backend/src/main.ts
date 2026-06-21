import 'dotenv/config';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  
  // Tăng giới hạn payload để xử lý ảnh base64 lớn (Fix lỗi 413)
  const express = require('express');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Mở CORS và cấu hình bảo mật cơ bản
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
    // Chuẩn hóa bỏ dấu gạch chéo cuối nếu có
    const normalizedUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
    if (!allowedOrigins.includes(normalizedUrl)) {
      allowedOrigins.push(normalizedUrl);
    }
  }

  console.log('=== CORS Allowed Origins ===', allowedOrigins);

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Cho phép đính kèm cookie/token
  });

  // Tùy chọn: Thêm tiền tố api, ví dụ: http://localhost:8080/api/users
  app.setGlobalPrefix('api');

  // Đồng bộ tồn kho tự động trên startup để tránh lệch giữa Product.stockQuantity và Inventory.currentStock
  const prismaService = app.get(PrismaService);
  try {
    const products = await prismaService.product.findMany();
    let syncedCount = 0;
    for (const prod of products) {
      const inv = await prismaService.inventory.findUnique({
        where: { productId: prod.id },
      });
      if (!inv) {
        await prismaService.inventory.create({
          data: {
            productId: prod.id,
            currentStock: prod.stockQuantity,
            lowStockThreshold: Math.floor(prod.stockQuantity * 0.15) || 10,
            lastImportDate: new Date(),
          },
        });
        syncedCount++;
      } else if (inv.currentStock !== prod.stockQuantity) {
        await prismaService.inventory.update({
          where: { productId: prod.id },
          data: { currentStock: prod.stockQuantity },
        });
        syncedCount++;
      }
    }
    if (syncedCount > 0) {
      console.log(`[Startup-Sync] Đã tự động đồng bộ ${syncedCount} bản ghi Inventory khớp với Product.stockQuantity.`);
    }
  } catch (err) {
    console.error('[Startup-Sync] Lỗi khi đồng bộ tồn kho tự động:', err);
  }

  await app.listen(8000); // Đổi port backend sang 8000 để tránh trùng Next.js
}
bootstrap();
