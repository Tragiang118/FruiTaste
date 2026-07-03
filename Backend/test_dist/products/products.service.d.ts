import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    create(data: any): Promise<{
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
    update(id: number, data: any): Promise<{
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
