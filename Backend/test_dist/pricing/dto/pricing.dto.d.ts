export declare class CalculatePricingDto {
    productId: number;
    costPrice: number;
    lossRate?: number;
    customProfitMargin?: number;
    manualPrice?: number;
}
export declare class UpdatePricingConfigDto {
    defaultTaxRate?: number;
    defaultProfitMargin?: number;
    minProfitMargin?: number;
    maxProfitMargin?: number;
}
