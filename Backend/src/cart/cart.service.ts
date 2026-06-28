import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) { }

  async getCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { id: 'asc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                mediaUrls: true,
                stockQuantity: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            orderBy: { id: 'asc' },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  mediaUrls: true,
                  stockQuantity: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });
    }

    return this.formatCartResponse(cart);
  }

  async addItem(userId: number, productId: number, quantity: number) {
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: userId, productId },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: userId,
          productId,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItemQuantity(
    userId: number,
    productId: number,
    quantity: number,
  ) {
    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: userId, productId },
    });

    if (!existing) {
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }

    if (quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity },
      });
    }

    return this.getCart(userId);
  }

  async removeItem(userId: number, productId: number) {
    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: userId, productId },
    });

    if (existing) {
      await this.prisma.cartItem.delete({ where: { id: existing.id } });
    }

    return this.getCart(userId);
  }

  async clearCart(userId: number) {
    await this.prisma.cartItem.deleteMany({
      where: { cartId: userId },
    });
    return { items: [] };
  }

  private formatCartResponse(cart: any) {
    if (!cart || !cart.items) return { items: [] };

    // Loại bỏ sản phẩm bị ẩn (isActive === false)
    const filteredItems = cart.items.filter((item: any) => item.product.isActive !== false);

    return {
      items: filteredItems.map((item: any) => {
        const stock = item.product.stockQuantity ?? 0;
        // Clamp số lượng về đúng tồn kho thực tế
        const clampedQty = Math.min(item.quantity, stock);
        return {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: clampedQty,
          image: item.product.mediaUrls?.[0] || '',
          stockQuantity: stock,
          isActive: item.product.isActive,
        };
      }),
    };
  }
}
