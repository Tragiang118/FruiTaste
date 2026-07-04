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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(startDate, endDate) {
        const dateFilter = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(start.getHours() - 7);
            const end = new Date(endDate);
            end.setHours(23 - 7, 59, 59, 999);
            dateFilter.createdAt = {
                gte: start,
                lte: end,
            };
        }
        const completedOrdersCount = await this.prisma.order.count({
            where: { ...dateFilter, status: 'COMPLETED' }
        });
        const cancelledOrdersCount = await this.prisma.order.count({
            where: { ...dateFilter, status: 'CANCELLED' }
        });
        const totalOrdersCount = await this.prisma.order.count({
            where: dateFilter
        });
        const pendingOrdersCount = await this.prisma.order.count({
            where: { status: 'PENDING' }
        });
        const processingOrdersCount = await this.prisma.order.count({
            where: { status: 'PREPARING' }
        });
        const totalUsers = await this.prisma.user.count({ where: { role: 'USER' } });
        const orders = await this.prisma.order.findMany({
            where: { ...dateFilter, status: 'COMPLETED' },
            select: { finalAmount: true, createdAt: true },
        });
        const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount, 0);
        let dateRange = [];
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                dateRange.push(d.toISOString().split('T')[0]);
            }
        }
        else {
            dateRange = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d.toISOString().split('T')[0];
            });
        }
        const revenueByDay = dateRange.map(date => {
            const dayRevenue = orders
                .filter(o => {
                const localDate = new Date(o.createdAt.getTime() + 7 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0];
                return localDate === date;
            })
                .reduce((sum, o) => sum + o.finalAmount, 0);
            return { date, revenue: dayRevenue };
        });
        const topProductsRaw = await this.prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            where: { order: { ...dateFilter, status: 'COMPLETED' } },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        });
        const topProducts = await Promise.all(topProductsRaw.map(async (item) => {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
                select: { name: true, price: true },
            });
            return {
                name: product?.name,
                quantity: item._sum.quantity,
                revenue: (product?.price || 0) * (item._sum.quantity || 0),
            };
        }));
        const soldProductIds = await this.prisma.orderItem.findMany({
            where: { order: { status: 'COMPLETED' } },
            select: { productId: true },
            distinct: ['productId'],
        });
        const soldIds = soldProductIds.map(i => i.productId);
        const unsoldProducts = await this.prisma.product.findMany({
            where: {
                id: { notIn: soldIds },
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                price: true,
                stockQuantity: true,
                unit: true,
            },
            take: 10,
        });
        return {
            overview: {
                totalOrders: totalOrdersCount,
                completedOrders: completedOrdersCount,
                cancelledOrders: cancelledOrdersCount,
                pendingOrders: pendingOrdersCount,
                processingOrders: processingOrdersCount,
                totalUsers,
                totalRevenue,
            },
            revenueByDay,
            topProducts,
            unsoldProducts,
        };
    }
    async getYearlyStats(year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        const orders = await this.prisma.order.findMany({
            where: {
                status: 'COMPLETED',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: { finalAmount: true, createdAt: true },
        });
        const months = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        const revenueByMonth = months.map((month, index) => {
            const monthRevenue = orders
                .filter(o => o.createdAt.getMonth() === index)
                .reduce((sum, o) => sum + o.finalAmount, 0);
            return { month, revenue: monthRevenue };
        });
        return revenueByMonth;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map