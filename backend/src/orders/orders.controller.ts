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
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { PaymentStatus } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(@Req() req: AuthenticatedRequest, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user.userId || req.user.id;
    return this.ordersService.create(userId, createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  async getMyOrders(@Req() req: AuthenticatedRequest) {
    return this.ordersService.findByUser(req.user.userId || req.user.id);
  }

  @Get('admin')
  async getAllForAdmin() {
    return this.ordersService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOrderById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    if (isNaN(+id)) return null;
    return this.ordersService.findById(+id, req.user.userId || req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/status')
  async updateOrderStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(+id, dto.status, req.user.userId || req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/payment-status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.ordersService.updatePaymentStatus(+id, dto.status as PaymentStatus);
  }
}


