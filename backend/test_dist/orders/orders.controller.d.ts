import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(req: any, createOrderDto: any): Promise<{
        payment: {
            method: import(".prisma/client").$Enums.PaymentMethod;
            status: import(".prisma/client").$Enums.PaymentStatus;
            transactionId: string | null;
            orderId: number;
        } | null;
        items: ({
            product: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                description: string | null;
                price: number;
                unit: string;
                stockQuantity: number;
                mediaUrls: string[];
                healthInfo: string | null;
                tags: string[];
                isDeleted: boolean;
            };
        } & {
            id: number;
            productId: number;
            quantity: number;
            priceAtPurchase: number;
            orderId: number;
        })[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        shippingName: string;
        shippingPhone: string;
        shippingAddress: string;
        totalAmount: number;
        shippingFee: number;
        finalAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        cancelledBy: import(".prisma/client").$Enums.Role | null;
        cancelledReason: string | null;
        confirmedAt: Date | null;
        preparingAt: Date | null;
        shippingAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    getMyOrders(req: any): Promise<({
        payment: {
            method: import(".prisma/client").$Enums.PaymentMethod;
            status: import(".prisma/client").$Enums.PaymentStatus;
            transactionId: string | null;
            orderId: number;
        } | null;
        items: ({
            product: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                description: string | null;
                price: number;
                unit: string;
                stockQuantity: number;
                mediaUrls: string[];
                healthInfo: string | null;
                tags: string[];
                isDeleted: boolean;
            };
        } & {
            id: number;
            productId: number;
            quantity: number;
            priceAtPurchase: number;
            orderId: number;
        })[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        shippingName: string;
        shippingPhone: string;
        shippingAddress: string;
        totalAmount: number;
        shippingFee: number;
        finalAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        cancelledBy: import(".prisma/client").$Enums.Role | null;
        cancelledReason: string | null;
        confirmedAt: Date | null;
        preparingAt: Date | null;
        shippingAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
    })[]>;
    getAllForAdmin(): Promise<({
        user: {
            email: string;
            fullName: string | null;
            phone: string | null;
        };
        payment: {
            method: import(".prisma/client").$Enums.PaymentMethod;
            status: import(".prisma/client").$Enums.PaymentStatus;
            transactionId: string | null;
            orderId: number;
        } | null;
        items: ({
            product: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                description: string | null;
                price: number;
                unit: string;
                stockQuantity: number;
                mediaUrls: string[];
                healthInfo: string | null;
                tags: string[];
                isDeleted: boolean;
            };
        } & {
            id: number;
            productId: number;
            quantity: number;
            priceAtPurchase: number;
            orderId: number;
        })[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        shippingName: string;
        shippingPhone: string;
        shippingAddress: string;
        totalAmount: number;
        shippingFee: number;
        finalAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        cancelledBy: import(".prisma/client").$Enums.Role | null;
        cancelledReason: string | null;
        confirmedAt: Date | null;
        preparingAt: Date | null;
        shippingAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
    })[]>;
    getOrderById(req: any, id: string): Promise<({
        payment: {
            method: import(".prisma/client").$Enums.PaymentMethod;
            status: import(".prisma/client").$Enums.PaymentStatus;
            transactionId: string | null;
            orderId: number;
        } | null;
        items: ({
            product: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                description: string | null;
                price: number;
                unit: string;
                stockQuantity: number;
                mediaUrls: string[];
                healthInfo: string | null;
                tags: string[];
                isDeleted: boolean;
            };
        } & {
            id: number;
            productId: number;
            quantity: number;
            priceAtPurchase: number;
            orderId: number;
        })[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        shippingName: string;
        shippingPhone: string;
        shippingAddress: string;
        totalAmount: number;
        shippingFee: number;
        finalAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        cancelledBy: import(".prisma/client").$Enums.Role | null;
        cancelledReason: string | null;
        confirmedAt: Date | null;
        preparingAt: Date | null;
        shippingAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }) | null>;
    updateOrderStatus(req: any, id: string, status: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        shippingName: string;
        shippingPhone: string;
        shippingAddress: string;
        totalAmount: number;
        shippingFee: number;
        finalAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        cancelledBy: import(".prisma/client").$Enums.Role | null;
        cancelledReason: string | null;
        confirmedAt: Date | null;
        preparingAt: Date | null;
        shippingAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    updatePaymentStatus(id: string, status: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
