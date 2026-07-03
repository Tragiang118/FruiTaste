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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CartService = class CartService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCart(userId) {
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
    async addItem(userId, productId, quantity) {
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
        }
        else {
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
    async updateItemQuantity(userId, productId, quantity) {
        const existing = await this.prisma.cartItem.findFirst({
            where: { cartId: userId, productId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Sản phẩm không có trong giỏ hàng');
        }
        if (quantity <= 0) {
            await this.prisma.cartItem.delete({ where: { id: existing.id } });
        }
        else {
            await this.prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity },
            });
        }
        return this.getCart(userId);
    }
    async removeItem(userId, productId) {
        const existing = await this.prisma.cartItem.findFirst({
            where: { cartId: userId, productId },
        });
        if (existing) {
            await this.prisma.cartItem.delete({ where: { id: existing.id } });
        }
        return this.getCart(userId);
    }
    async clearCart(userId) {
        await this.prisma.cartItem.deleteMany({
            where: { cartId: userId },
        });
        return { items: [] };
    }
    formatCartResponse(cart) {
        if (!cart || !cart.items)
            return { items: [] };
        const filteredItems = cart.items.filter((item) => item.product.isActive !== false);
        return {
            items: filteredItems.map((item) => {
                const stock = item.product.stockQuantity ?? 0;
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
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map