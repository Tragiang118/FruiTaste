import { PricingService } from './pricing.service';
import { CalculatePricingDto, UpdatePricingConfigDto } from './dto/pricing.dto';
export declare class PricingController {
    private readonly pricingService;
    constructor(pricingService: PricingService);
    getConfig(): Promise<{
        updatedAt: Date;
        id: number;
        defaultTaxRate: number;
        defaultProfitMargin: number;
        minProfitMargin: number;
        maxProfitMargin: number;
    }>;
    updateConfig(dto: UpdatePricingConfigDto): Promise<{
        updatedAt: Date;
        id: number;
        defaultTaxRate: number;
        defaultProfitMargin: number;
        minProfitMargin: number;
        maxProfitMargin: number;
    }>;
    getProductPricing(id: number): Promise<{
        product: {
            name: string;
            price: number;
        };
    } & {
        updatedAt: Date;
        productId: number;
        costPrice: number;
        lossRate: number;
        customProfitMargin: number | null;
        manualPrice: number | null;
    }>;
    calculatePrice(dto: CalculatePricingDto): Promise<{
        suggestedPrice: number;
        isManual: boolean;
        breakdown: {
            effectiveCost: number;
            taxes: number;
            actualProfit: number;
            profitMargin: number;
            expectedProfit?: undefined;
        };
    } | {
        suggestedPrice: number;
        isManual: boolean;
        breakdown: {
            effectiveCost: number;
            taxes: number;
            expectedProfit: number;
            profitMargin: number;
            actualProfit?: undefined;
        };
    }>;
    applyPrice(id: number, dto: CalculatePricingDto): Promise<{
        suggestedPrice: number;
        isManual: boolean;
        breakdown: {
            effectiveCost: number;
            taxes: number;
            actualProfit: number;
            profitMargin: number;
            expectedProfit?: undefined;
        };
    } | {
        suggestedPrice: number;
        isManual: boolean;
        breakdown: {
            effectiveCost: number;
            taxes: number;
            expectedProfit: number;
            profitMargin: number;
            actualProfit?: undefined;
        };
    }>;
}
