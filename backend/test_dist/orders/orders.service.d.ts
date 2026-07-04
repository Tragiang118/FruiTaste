import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';
export declare class OrdersService {
    private prisma;
    private inventoryService;
    constructor(prisma: PrismaService, inventoryService: InventoryService);
    handleOrderAutoCancellation(): Promise<void>;
    create(userId: number, createOrderDto: any): Promise<{
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
    findAllAdmin(): Promise<({
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
    findByUser(userId: number): Promise<({
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
    findById(id: number, userId: number, role: string): Promise<{
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
    updateStatus(id: number, status: any, userId?: number, role?: string): Promise<{
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
    updatePaymentStatus(id: number, status: PaymentStatus): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
