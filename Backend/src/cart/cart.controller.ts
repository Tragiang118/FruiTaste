import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post()
  addItem(
    @Request() req,
    @Body() body: { productId: number; quantity: number },
  ) {
    if (!body.productId || !body.quantity) {
      throw new Error('Missing productId or quantity');
    }
    return this.cartService.addItem(
      req.user.userId,
      body.productId,
      body.quantity,
    );
  }

  @Put(':productId')
  updateItemQuantity(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.cartService.updateItemQuantity(
      req.user.userId,
      productId,
      quantity,
    );
  }

  @Delete(':productId')
  removeItem(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.cartService.removeItem(req.user.userId, productId);
  }

  @Delete()
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}
