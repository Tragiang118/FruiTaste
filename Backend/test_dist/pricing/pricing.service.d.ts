import { PrismaService } from '../prisma/prisma.service';
import { CalculatePricingDto, UpdatePricingConfigDto } from './dto/pricing.dto';
export declare class PricingService {
    private prisma;
    constructor(prisma: PrismaService);
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
    getProductPricing(productId: number): Promise<{
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
    updateProductPricing(productId: number, dto: CalculatePricingDto): Promise<{
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
