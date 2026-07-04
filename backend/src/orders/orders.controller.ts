import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user.userId;
    return this.ordersService.create(userId, createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  async getMyOrders(@Req() req: any) {
    return this.ordersService.findByUser(req.user.userId);
  }

  @Get('admin')
  async getAllForAdmin() {
    return this.ordersService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOrderById(@Req() req: any, @Param('id') id: string) {
    if (isNaN(+id)) return null;
    return this.ordersService.findById(+id, req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/status')
  async updateOrderStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(+id, dto.status, req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/payment-status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.ordersService.updatePaymentStatus(+id, dto.status as any);
  }
}


