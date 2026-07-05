import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { RecipesModule } from './recipes/recipes.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { UploadModule } from './upload/upload.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InventoryModule } from './inventory/inventory.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { MailModule } from './mail/mail.module';
import { PricingModule } from './pricing/pricing.module';
import { ChatModule } from './chat/chat.module';

import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100, // Default limit per min for general routes
      },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    MailModule,
    CategoriesModule,
    ProductsModule,
    RecipesModule,
    CartModule,
    OrdersModule,
    UploadModule,
    DashboardModule,
    InventoryModule,
    PricingModule,
    ChatModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
