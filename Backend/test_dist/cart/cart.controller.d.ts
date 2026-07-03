import { CartService } from './cart.service';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(req: any): Promise<{
        items: any;
    }>;
    addItem(req: any, body: {
        productId: number;
        quantity: number;
    }): Promise<{
        items: any;
    }>;
    updateItemQuantity(req: any, productId: number, quantity: number): Promise<{
        items: any;
    }>;
    removeItem(req: any, productId: number): Promise<{
        items: any;
    }>;
    clearCart(req: any): Promise<{
        items: never[];
    }>;
}
