"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PricingService = class PricingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConfig() {
        let config = await this.prisma.pricingConfig.findFirst();
        if (!config) {
            config = await this.prisma.pricingConfig.create({
                data: { id: 1 }
            });
        }
        return config;
    }
    async updateConfig(dto) {
        const config = await this.getConfig();
        return this.prisma.pricingConfig.update({
            where: { id: config.id },
            data: dto
        });
    }
    async getProductPricing(productId) {
        const pricing = await this.prisma.productPricing.findUnique({
            where: { productId },
            include: { product: { select: { name: true, price: true } } }
        });
        if (!pricing) {
            const product = await this.prisma.product.findUnique({ where: { id: productId } });
            if (!product)
                throw new common_1.NotFoundException('Sản phẩm không tồn tại');
            return this.prisma.productPricing.create({
                data: {
                    productId,
                    costPrice: product.price * 0.7,
                },
                include: { product: { select: { name: true, price: true } } }
            });
        }
        return pricing;
    }
    async calculatePrice(dto) {
        const config = await this.getConfig();
        const { costPrice, lossRate = 0.05, customProfitMargin, manualPrice } = dto;
        const taxRate = config.defaultTaxRate;
        const profitMargin = customProfitMargin ?? config.defaultProfitMargin;
        if (manualPrice && manualPrice > 0) {
            const taxes = manualPrice * taxRate;
            const profit = manualPrice - (costPrice / (1 - lossRate)) - taxes;
            return {
                suggestedPrice: manualPrice,
                isManual: true,
                breakdown: {
                    effectiveCost: costPrice / (1 - lossRate),
                    taxes,
                    actualProfit: profit,
                    profitMargin: (profit / manualPrice) * 100
                }
            };
        }
        const effectiveCost = costPrice / (1 - lossRate);
        const totalVariableRates = profitMargin + taxRate;
        if (totalVariableRates >= 1) {
            throw new common_1.BadRequestException('Tổng tỷ lệ lợi nhuận và thuế không được vượt quá 100%');
        }
        let suggestedPrice = effectiveCost / (1 - totalVariableRates);
        suggestedPrice = Math.ceil(suggestedPrice / 1000) * 1000;
        return {
            suggestedPrice,
            isManual: false,
            breakdown: {
                effectiveCost,
                taxes: suggestedPrice * taxRate,
                expectedProfit: suggestedPrice * profitMargin,
                profitMargin: profitMargin * 100
            }
        };
    }
    async updateProductPricing(productId, dto) {
        const result = await this.calculatePrice(dto);
        await this.prisma.productPricing.upsert({
            where: { productId },
            create: {
                productId,
                costPrice: dto.costPrice,
                lossRate: dto.lossRate,
                customProfitMargin: dto.customProfitMargin,
                manualPrice: dto.manualPrice
            },
            update: {
                costPrice: dto.costPrice,
                lossRate: dto.lossRate,
                customProfitMargin: dto.customProfitMargin,
                manualPrice: dto.manualPrice
            }
        });
        await this.prisma.product.update({
            where: { id: productId },
            data: { price: result.suggestedPrice }
        });
        return result;
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PricingService);
//# sourceMappingURL=pricing.service.js.map