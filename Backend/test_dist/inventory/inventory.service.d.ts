import { PrismaService } from '../prisma/prisma.service';
export declare class InventoryService {
    private prisma;
    constructor(prisma: PrismaService);
    getInventoryList(): Promise<({
        product: {
            name: string;
            price: number;
            unit: string;
            stockQuantity: number;
        };
    } & {
        updatedAt: Date;
        currentStock: number;
        lowStockThreshold: number;
        lastImportDate: Date | null;
        lastExportDate: Date | null;
        productId: number;
    })[]>;
    getLowStock(): Promise<({
        product: {
            name: string;
            unit: string;
            stockQuantity: number;
        };
    } & {
        updatedAt: Date;
        currentStock: number;
        lowStockThreshold: number;
        lastImportDate: Date | null;
        lastExportDate: Date | null;
        productId: number;
    })[]>;
    importProducts(dto: any): Promise<{
        createdAt: Date;
        id: number;
        note: string | null;
        supplier: string | null;
        totalItems: number;
        totalCost: number | null;
    }>;
    exportProducts(dto: any): Promise<{
        createdAt: Date;
        id: number;
        note: string | null;
        totalItems: number;
        receiver: string | null;
    }>;
    adjustStock(dto: any): Promise<{
        createdAt: Date;
        id: number;
        productId: number;
        quantity: number;
        reason: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        previousStock: number;
        newStock: number;
        referenceId: string | null;
    }>;
    getTransactions(limit?: number): Promise<({
        product: {
            name: string;
            unit: string;
        };
    } & {
        createdAt: Date;
        id: number;
        productId: number;
        quantity: number;
        reason: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        previousStock: number;
        newStock: number;
        referenceId: string | null;
    })[]>;
    exportStockOnOrder(tx: any, productId: number, quantity: number, orderId: number): Promise<void>;
    returnStockOnCancel(tx: any, productId: number, quantity: number, orderId: number): Promise<void>;
    getImportReceipt(id: number): Promise<{
        items: ({
            product: {
                name: string;
                unit: string;
            };
        } & {
            id: number;
            productId: number;
            quantity: number;
            importPrice: number | null;
            receiptId: number;
        })[];
    } & {
        createdAt: Date;
        id: number;
        note: string | null;
        supplier: string | null;
        totalItems: number;
        totalCost: number | null;
    }>;
    getExportReceipt(id: number): Promise<{
        items: ({
            product: {
                name: string;
                unit: string;
            };
        } & {
            id: number;
            productId: number;
            quantity: number;
            receiptId: number;
        })[];
    } & {
        createdAt: Date;
        id: number;
        note: string | null;
        totalItems: number;
        receiver: string | null;
    }>;
}
