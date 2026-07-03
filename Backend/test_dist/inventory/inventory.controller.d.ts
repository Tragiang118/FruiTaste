import { InventoryService } from './inventory.service';
import { ImportInventoryDto } from './dto/import-inventory.dto';
import { ExportInventoryDto } from './dto/export-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getList(): Promise<({
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
    getTransactions(limit?: string): Promise<({
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
    getImportReceipt(id: string): Promise<{
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
    getExportReceipt(id: string): Promise<{
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
    import(dto: ImportInventoryDto): Promise<{
        createdAt: Date;
        id: number;
        note: string | null;
        supplier: string | null;
        totalItems: number;
        totalCost: number | null;
    }>;
    export(dto: ExportInventoryDto): Promise<{
        createdAt: Date;
        id: number;
        note: string | null;
        totalItems: number;
        receiver: string | null;
    }>;
    adjust(dto: AdjustInventoryDto): Promise<{
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
}
