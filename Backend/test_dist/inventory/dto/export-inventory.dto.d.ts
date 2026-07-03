declare class ExportItemDto {
    productId: number;
    quantity: number;
}
export declare class ExportInventoryDto {
    receiver?: string;
    reason?: string;
    note?: string;
    items: ExportItemDto[];
    createdAt?: Date;
}
export {};
