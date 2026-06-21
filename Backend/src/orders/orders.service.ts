import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentStatus } from '@prisma/client';

import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService
  ) { }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleOrderAutoCancellation() {
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    const expiredOrders = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: twoHoursAgo },
      },
      include: { items: true },
    });

    if (expiredOrders.length === 0) return;

    console.log(`[Cron] Hủy ${expiredOrders.length} đơn hàng quá hạn thanh toán.`);

    for (const order of expiredOrders) {
      try {
        await this.prisma.$transaction(async (tx) => {
          // Hoàn kho
          for (const item of order.items) {
            await this.inventoryService.returnStockOnCancel(tx, item.productId, item.quantity, order.id);
          }

          // Cập nhật trạng thái
          await tx.order.update({
            where: { id: order.id },
            data: { 
              status: 'CANCELLED',
              cancelledBy: 'ADMIN', // Hệ thống tự hủy coi như Admin
              cancelledAt: new Date(),
            },
          });
        });
      } catch (err) {
        console.error(`Lỗi khi tự động hủy đơn #${order.id}:`, err);
      }
    }
  }

  async create(userId: number, createOrderDto: any) {
    const {
      items,
      shippingName,
      shippingPhone,
      shippingAddress,
      totalAmount,
      shippingFee,
      finalAmount,
      paymentMethod,
    } = createOrderDto;

    // ...

    return await this.prisma.$transaction(async (tx) => {
      let orderTotalAmount = 0;

      // 1. Kiểm tra tồn
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          throw new BadRequestException({
            message: `Sản phẩm (ID: ${item.productId}) không tồn tại.`,
            productId: item.productId,
          });
        }
        if (!product.isActive) {
          throw new BadRequestException({
            message: `Sản phẩm '${product.name}' đã tạm dừng bán, vui lòng cập nhật xóa khỏi giỏ hàng để tiếp tục.`,
            productId: product.id,
          });
        }
        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException({
            message: `Sản phẩm '${product.name}' hiện không đủ tồn kho (Còn: ${product.stockQuantity}).`,
            productId: product.id,
          });
        }
        orderTotalAmount += product.price * item.quantity;
      }

      const order = await tx.order.create({
        data: {
          user: { connect: { id: userId } },
          shippingName,
          shippingPhone,
          shippingAddress,
          totalAmount: orderTotalAmount,
          shippingFee,
          finalAmount: orderTotalAmount + shippingFee,
          items: {
            create: items.map((i: any) => ({
              product: { connect: { id: i.productId } },
              quantity: i.quantity,
              priceAtPurchase: i.priceAtPurchase || i.price,
            })),
          },
          payment: {
            create: {
              method:
                paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'COD',
              status: 'PENDING',
            },
          },
        },
        include: { items: { include: { product: true } }, payment: true },
      });

      // 2. Trừ tồn kho và ghi log
      for (const item of items) {
        await this.inventoryService.exportStockOnOrder(tx, item.productId, item.quantity, order.id);
      }

      return order;
    });
  }

  async findAllAdmin() {
    return this.prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        payment: true,
        user: {
          select: {
            fullName: true,
            phone: true,
            email: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number, userId: number, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        payment: true
      }
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy thông tin đơn hàng này.');
    }

    if (order.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền truy cập đơn hàng này.');
    }

    return order;
  }

  async updateStatus(id: number, status: any, userId?: number, role?: string) {
    console.log(`[DEBUG] Update Order Status - ID: ${id}, Status: ${status}, UserID: ${userId}, Role: ${role}`);
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order)
      throw new NotFoundException('Không tìm thấy thông tin đơn hàng này.');

    // Kiểm tra quyền đối với khách hàng (không phải ADMIN)
    if (role !== 'ADMIN') {
      if (order.userId !== userId) {
        throw new ForbiddenException('Bạn không có quyền thao tác trên đơn hàng này.');
      }
      if (status !== 'CANCELLED') {
        throw new BadRequestException('Bạn không có quyền thay đổi trạng thái này.');
      }
      if (order.status !== 'PENDING') {
        throw new BadRequestException('Bạn chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận.');
      }
    }

    // Nếu hủy đơn hàng, cần hoàn lại tồn kho
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      return await this.prisma.$transaction(async (tx) => {
        const items = await tx.orderItem.findMany({ where: { orderId: id } });
        for (const item of items) {
          await this.inventoryService.returnStockOnCancel(tx, item.productId, item.quantity, id);
        }
        // Lấy role thực tế từ database để đảm bảo chính xác
        const user = await tx.user.findUnique({ where: { id: userId } });
        const actorRole = user?.role || 'USER';

        const updatedOrder = await tx.order.update({
          where: { id },
          data: { 
            status,
            cancelledBy: actorRole === 'ADMIN' ? 'ADMIN' : 'USER',
            cancelledAt: new Date(),
          },
        });

        // Tích hợp Module Auto-Ban: Chỉ đếm các đơn bị hủy bởi USER trong vòng 30 ngày gần đây
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const failedCount = await tx.order.count({
          where: {
            userId: order.userId,
            status: 'CANCELLED',
            cancelledBy: 'USER',
            cancelledAt: { gte: thirtyDaysAgo }
          }
        });

        // Nếu >= 5 lần hủy đơn -> Khóa tài khoản ngay lập tức
        if (failedCount >= 5) {
          await tx.user.update({
            where: { id: order.userId },
            data: { isActive: false }
          });
          console.log(`[Auto-Ban] Đã TỰ ĐỘNG KHÓA tài khoản ID: ${order.userId} do có ${failedCount} đơn hàng bị khách hàng tự hủy trong 30 ngày qua.`);
        }

        return updatedOrder;
      });
    }

    if (status === 'COMPLETED') {
      await this.prisma.payment.updateMany({
        where: { orderId: id },
        data: { status: 'SUCCESS' },
      });
    }

    const updateData: any = { status };
    if (status === 'CONFIRMED') {
      updateData.confirmedAt = new Date();
    } else if (status === 'PREPARING') {
      updateData.preparingAt = new Date();
    } else if (status === 'SHIPPING') {
      updateData.shippingAt = new Date();
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    return this.prisma.order.update({
      where: { id },
      data: updateData,
    });
  }

  async updatePaymentStatus(id: number, status: PaymentStatus) {
    return this.prisma.payment.updateMany({
      where: { orderId: id },
      data: { status },
    });
  }
}
