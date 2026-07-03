import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
    getYearlyStats(year?: string): Promise<{
        month: string;
        revenue: number;
    }[]>;
}
