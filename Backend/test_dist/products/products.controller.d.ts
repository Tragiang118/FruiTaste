import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(search?: string): Promise<({
        inventory: {
            updatedAt: Date;
            currentStock: number;
            lowStockThreshold: number;
            lastImportDate: Date | null;
            lastExportDate: Date | null;
            productId: number;
        } | null;
        categories: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
            imageUrl: string | null;
        }[];
    } & {
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
    })[]>;
    findAllAdmin(): Promise<({
        inventory: {
            updatedAt: Date;
            currentStock: number;
            lowStockThreshold: number;
            lastImportDate: Date | null;
            lastExportDate: Date | null;
            productId: number;
        } | null;
        categories: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
            imageUrl: string | null;
        }[];
    } & {
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
    })[]>;
    findOne(id: number): Promise<{
        inventory: {
            updatedAt: Date;
            currentStock: number;
            lowStockThreshold: number;
            lastImportDate: Date | null;
            lastExportDate: Date | null;
            productId: number;
        } | null;
        categories: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
            imageUrl: string | null;
        }[];
    } & {
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
    }>;
    create(createData: any): Promise<{
        inventory: {
            updatedAt: Date;
            currentStock: number;
            lowStockThreshold: number;
            lastImportDate: Date | null;
            lastExportDate: Date | null;
            productId: number;
        } | null;
        categories: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
            imageUrl: string | null;
        }[];
    } & {
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
    }>;
    update(id: number, updateData: any): Promise<{
        categories: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
            imageUrl: string | null;
        }[];
    } & {
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
    }>;
    remove(id: number): Promise<{
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
    }>;
}
