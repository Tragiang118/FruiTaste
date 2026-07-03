import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(startDate?: string, endDate?: string): Promise<{
        overview: {
            totalOrders: number;
            completedOrders: number;
            cancelledOrders: number;
            pendingOrders: number;
            processingOrders: number;
            totalUsers: number;
            totalRevenue: number;
        };
        revenueByDay: {
            date: string;
            revenue: number;
        }[];
        topProducts: {
            name: string | undefined;
            quantity: number | null;
            revenue: number;
        }[];
        unsoldProducts: {
            id: number;
            name: string;
            price: number;
            unit: string;
            stockQuantity: number;
        }[];
    }>;
    getYearlyStats(year: number): Promise<{
        month: string;
        revenue: number;
    }[]>;
}
