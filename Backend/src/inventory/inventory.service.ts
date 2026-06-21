import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventoryList() {
    return this.prisma.inventory.findMany({
      where: {
        product: {
          isActive: true,
          isDeleted: false
        }
      },
      include: {
        product: {
          select: {
            name: true,
            unit: true,
            price: true,
            stockQuantity: true,
          }
        }
      }
    });
  }

  async getLowStock() {
    return this.prisma.inventory.findMany({
      where: {
        currentStock: {
          lte: this.prisma.inventory.fields.lowStockThreshold
        },
        product: {
          isActive: true,
          isDeleted: false
        }
      },
      include: {
        product: { select: { name: true, unit: true, stockQuantity: true } }
      }
    });
  }

  async importProducts(dto: any) {
    const { note, items, supplier } = dto;
    
    return this.prisma.$transaction(async (tx) => {
      const receipt = await tx.importReceipt.create({
        data: {
          note,
          supplier,
          totalItems: items.length,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });

      for (const item of items) {
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId }
        });

        const prevStock = inventory ? inventory.currentStock : 0;
        const newStock = prevStock + item.quantity;

        await tx.inventory.upsert({
          where: { productId: item.productId },
          create: {
            productId: item.productId,
            currentStock: item.quantity,
            lowStockThreshold: 10,
            lastImportDate: new Date(),
          },
          update: {
            currentStock: { increment: item.quantity },
            lastImportDate: new Date(),
          }
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } }
        });

        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            type: TransactionType.IMPORT,
            quantity: item.quantity,
            previousStock: prevStock,
            newStock: newStock,
            reason: `Nhập kho - Phiếu #${receipt.id}`,
            referenceId: receipt.id.toString()
          }
        });
      }
      return receipt;
    });
  }

  async exportProducts(dto: any) {
    const { note, items, receiver } = dto;

    return this.prisma.$transaction(async (tx) => {
      const receipt = await tx.exportReceipt.create({
        data: {
          note,
          receiver,
          totalItems: items.length,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              reason: item.reason
            }))
          }
        }
      });

      for (const item of items) {
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId }
        });

        if (!inventory || inventory.currentStock < item.quantity) {
          throw new BadRequestException(`Sản phẩm ID ${item.productId} không đủ tồn kho`);
        }

        const updatedInventory = await tx.inventory.update({
          where: { productId: item.productId },
          data: { 
            currentStock: { decrement: item.quantity },
            lastExportDate: new Date()
          }
        });

        if (updatedInventory.currentStock < 0) {
          throw new BadRequestException(`Sản phẩm ID ${item.productId} không đủ tồn kho`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } }
        });

        const prevStock = updatedInventory.currentStock + item.quantity;
        const newStock = updatedInventory.currentStock;

        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            type: TransactionType.EXPORT,
            quantity: -item.quantity,
            previousStock: prevStock,
            newStock: newStock,
            reason: `Xuất kho: ${item.reason || 'Không có lý do'} - Phiếu #${receipt.id}`,
            referenceId: receipt.id.toString()
          }
        });
      }
      return receipt;
    });
  }

  async adjustStock(dto: any) {
    const { productId, quantity, reason } = dto;
    const inventory = await this.prisma.inventory.findUnique({ where: { productId } });
    if (!inventory) throw new NotFoundException('Không tìm thấy sản phẩm trong kho');

    const prevStock = inventory.currentStock;
    const newStock = quantity;

    return this.prisma.$transaction(async (tx) => {
      await tx.inventory.update({
        where: { productId },
        data: { 
          currentStock: newStock,
          lastExportDate: new Date()
        }
      });

      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: newStock }
      });

      return tx.stockTransaction.create({
        data: {
          productId,
          type: TransactionType.ADJUST,
          quantity: newStock - prevStock,
          previousStock: prevStock,
          newStock: newStock,
          reason: reason || 'Điều chỉnh kho thủ công'
        }
      });
    });
  }

  async getTransactions(limit = 100) {
    return this.prisma.stockTransaction.findMany({
      take: limit,
      include: {
        product: { select: { name: true, unit: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async exportStockOnOrder(tx: any, productId: number, quantity: number, orderId: number) {
    const inventory = await tx.inventory.findUnique({
      where: { productId }
    });

    const currentStock = inventory ? inventory.currentStock : 0;
    const newStock = currentStock - quantity;

    if (newStock < 0) {
      const product = await tx.product.findUnique({ where: { id: productId } });
      const productName = product ? `'${product.name}'` : `ID ${productId}`;
      throw new BadRequestException(`Sản phẩm ${productName} không đủ tồn kho (Còn: ${currentStock})`);
    }

    await tx.inventory.upsert({
      where: { productId },
      create: {
        productId,
        currentStock: newStock,
        lowStockThreshold: 10,
      },
      update: {
        currentStock: { decrement: quantity }
      }
    });

    await tx.product.update({
      where: { id: productId },
      data: { stockQuantity: { decrement: quantity } }
    });

    await tx.stockTransaction.create({
      data: {
        productId,
        type: TransactionType.EXPORT,
        quantity: -quantity,
        previousStock: currentStock,
        newStock: newStock,
        reason: `Xuất kho - Đơn hàng #${orderId}`,
        referenceId: orderId.toString()
      }
    });
  }

  async returnStockOnCancel(tx: any, productId: number, quantity: number, orderId: number) {
    const inventory = await tx.inventory.findUnique({
      where: { productId }
    });

    const currentStock = inventory ? inventory.currentStock : 0;
    const newStock = currentStock + quantity;

    await tx.inventory.upsert({
      where: { productId },
      create: {
        productId,
        currentStock: newStock,
        lowStockThreshold: 10,
      },
      update: {
        currentStock: { increment: quantity }
      }
    });

    await tx.product.update({
      where: { id: productId },
      data: { stockQuantity: { increment: quantity } }
    });

    await tx.stockTransaction.create({
      data: {
        productId,
        type: TransactionType.RETURN,
        quantity,
        previousStock: currentStock,
        newStock: newStock,
        reason: `Hoàn kho - Hủy đơn #${orderId}`,
        referenceId: orderId.toString()
      }
    });
  }
}
