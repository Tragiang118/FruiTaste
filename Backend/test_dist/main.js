"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const dns_1 = __importDefault(require("dns"));
dns_1.default.setDefaultResultOrder('ipv4first');
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.use((0, cookie_parser_1.default)());
    const express = require('express');
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
    ];
    if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL);
        const normalizedUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
        if (!allowedOrigins.includes(normalizedUrl)) {
            allowedOrigins.push(normalizedUrl);
        }
    }
    console.log('=== CORS Allowed Origins ===', allowedOrigins);
    app.enableCors({
        origin: allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.setGlobalPrefix('api');
    const prismaService = app.get(prisma_service_1.PrismaService);
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
            }
            else if (inv.currentStock !== prod.stockQuantity) {
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
    }
    catch (err) {
        console.error('[Startup-Sync] Lỗi khi đồng bộ tồn kho tự động:', err);
    }
    await app.listen(8000);
}
bootstrap();
//# sourceMappingURL=main.js.map