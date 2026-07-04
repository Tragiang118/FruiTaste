"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
const inventory_service_1 = require("../inventory/inventory.service");
let OrdersService = class OrdersService {
    prisma;
    inventoryService;
    constructor(prisma, inventoryService) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
    }
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
        if (expiredOrders.length === 0)
            return;
        console.log(`[Cron] Hủy ${expiredOrders.length} đơn hàng quá hạn thanh toán.`);
        for (const order of expiredOrders) {
            try {
                await this.prisma.$transaction(async (tx) => {
                    for (const item of order.items) {
                        await this.inventoryService.returnStockOnCancel(tx, item.productId, item.quantity, order.id);
                    }
                    await tx.order.update({
                        where: { id: order.id },
                        data: {
                            status: 'CANCELLED',
                            cancelledBy: 'ADMIN',
                            cancelledReason: 'SYSTEM',
                            cancelledAt: new Date(),
                        },
                    });
                });
            }
            catch (err) {
                console.error(`Lỗi khi tự động hủy đơn #${order.id}:`, err);
            }
        }
    }
    async create(userId, createOrderDto) {
        const { items, shippingName, shippingPhone, shippingAddress, totalAmount, shippingFee, finalAmount, paymentMethod, } = createOrderDto;
        return await this.prisma.$transaction(async (tx) => {
            let orderTotalAmount = 0;
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });
                if (!product) {
                    throw new common_1.BadRequestException({
                        message: `Sản phẩm (ID: ${item.productId}) không tồn tại.`,
                        productId: item.productId,
                    });
                }
                if (!product.isActive) {
                    throw new common_1.BadRequestException({
                        message: `Sản phẩm '${product.name}' đã tạm dừng bán, vui lòng cập nhật xóa khỏi giỏ hàng để tiếp tục.`,
                        productId: product.id,
                    });
                }
                if (product.stockQuantity < item.quantity) {
                    throw new common_1.BadRequestException({
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
                        create: items.map((i) => ({
                            product: { connect: { id: i.productId } },
                            quantity: i.quantity,
                            priceAtPurchase: i.priceAtPurchase || i.price,
                        })),
                    },
                    payment: {
                        create: {
                            method: paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'COD',
                            status: 'PENDING',
                        },
                    },
                },
                include: { items: { include: { product: true } }, payment: true },
            });
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
    async findByUser(userId) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                items: { include: { product: true } },
                payment: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id, userId, role) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                payment: true
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Không tìm thấy thông tin đơn hàng này.');
        }
        if (order.userId !== userId && role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập đơn hàng này.');
        }
        return order;
    }
    async updateStatus(id, status, userId, role) {
        console.log(`[DEBUG] Update Order Status - ID: ${id}, Status: ${status}, UserID: ${userId}, Role: ${role}`);
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Không tìm thấy thông tin đơn hàng này.');
        if (role !== 'ADMIN') {
            if (order.userId !== userId) {
                throw new common_1.ForbiddenException('Bạn không có quyền thao tác trên đơn hàng này.');
            }
            if (status !== 'CANCELLED') {
                throw new common_1.BadRequestException('Bạn không có quyền thay đổi trạng thái này.');
            }
            if (order.status !== 'PENDING') {
                throw new common_1.BadRequestException('Bạn chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận.');
            }
        }
        if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
            return await this.prisma.$transaction(async (tx) => {
                const items = await tx.orderItem.findMany({ where: { orderId: id } });
                for (const item of items) {
                    await this.inventoryService.returnStockOnCancel(tx, item.productId, item.quantity, id);
                }
                const user = await tx.user.findUnique({ where: { id: userId } });
                const actorRole = user?.role || 'USER';
                const updatedOrder = await tx.order.update({
                    where: { id },
                    data: {
                        status,
                        cancelledBy: actorRole === 'ADMIN' ? 'ADMIN' : 'USER',
                        cancelledReason: actorRole === 'ADMIN' ? 'ADMIN' : 'USER',
                        cancelledAt: new Date(),
                    },
                });
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
        const updateData = { status };
        if (status === 'CONFIRMED') {
            updateData.confirmedAt = new Date();
        }
        else if (status === 'PREPARING') {
            updateData.preparingAt = new Date();
        }
        else if (status === 'SHIPPING') {
            updateData.shippingAt = new Date();
        }
        else if (status === 'COMPLETED') {
            updateData.completedAt = new Date();
        }
        return this.prisma.order.update({
            where: { id },
            data: updateData,
        });
    }
    async updatePaymentStatus(id, status) {
        return this.prisma.payment.updateMany({
            where: { orderId: id },
            data: { status },
        });
    }
};
exports.OrdersService = OrdersService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersService.prototype, "handleOrderAutoCancellation", null);
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_service_1.InventoryService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map