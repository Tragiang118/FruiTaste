import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(startDate?: string, endDate?: string) {
    const dateFilter: any = {};
    
    if (startDate && endDate) {
      // Điều chỉnh múi giờ Việt Nam (UTC+7)
      // Local 00:00 = UTC 17:00 ngày hôm trước
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
    
    // Đơn cần xử lý (Pending) trên toàn hệ thống (không lọc theo ngày)
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

    // Thống kê doanh thu theo từng ngày trong khoảng đã chọn
    let dateRange: string[] = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateRange.push(d.toISOString().split('T')[0]);
      }
    } else {
      // Mặc định 7 ngày gần nhất
      dateRange = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });
    }

    const revenueByDay = dateRange.map(date => {
      const dayRevenue = orders
        .filter(o => {
          // Chuyển sang múi giờ VN trước khi so sánh ngày
          const localDate = new Date(o.createdAt.getTime() + 7 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
          return localDate === date;
        })
        .reduce((sum, o) => sum + o.finalAmount, 0);
      return { date, revenue: dayRevenue };
    });

    // Sản phẩm bán chạy trong khoảng thời gian đó
    const topProductsRaw = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: { order: { ...dateFilter, status: 'COMPLETED' } },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProducts = await Promise.all(
      topProductsRaw.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true },
        });
        return {
          name: product?.name,
          quantity: item._sum.quantity,
          revenue: (product?.price || 0) * (item._sum.quantity || 0),
        };
      }),
    );

    // Các loại quả chưa ai mua
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

  async getYearlyStats(year: number) {
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
}
