declare class ImportItemDto {
    productId: number;
    quantity: number;
    importPrice?: number;
}
export declare class ImportInventoryDto {
    note?: string;
    items: ImportItemDto[];
}
export {};
