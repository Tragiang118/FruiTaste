import { PrismaService } from '../prisma/prisma.service';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    getCart(userId: number): Promise<{
        items: any;
    }>;
    addItem(userId: number, productId: number, quantity: number): Promise<{
        items: any;
    }>;
    updateItemQuantity(userId: number, productId: number, quantity: number): Promise<{
        items: any;
    }>;
    removeItem(userId: number, productId: number): Promise<{
        items: any;
    }>;
    clearCart(userId: number): Promise<{
        items: never[];
    }>;
    private formatCartResponse;
}
