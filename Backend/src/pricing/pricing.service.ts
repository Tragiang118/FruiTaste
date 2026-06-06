import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalculatePricingDto, UpdatePricingConfigDto } from './dto/pricing.dto';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy cấu hình giá chung
   */
  async getConfig() {
    let config = await this.prisma.pricingConfig.findFirst();
    if (!config) {
      config = await this.prisma.pricingConfig.create({
        data: { id: 1 }
      });
    }
    return config;
  }

  /**
   * Cập nhật cấu hình giá chung
   */
  async updateConfig(dto: UpdatePricingConfigDto) {
    const config = await this.getConfig();
    return this.prisma.pricingConfig.update({
      where: { id: config.id },
      data: dto
    });
  }

  /**
   * Lấy thông tin giá của một sản phẩm
   */
  async getProductPricing(productId: number) {
    const pricing = await this.prisma.productPricing.findUnique({
      where: { productId },
      include: { product: { select: { name: true, price: true } } }
    });

    if (!pricing) {
      // Nếu chưa có, tạo bản ghi mặc định dựa trên giá hiện tại của SP
      const product = await this.prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

      return this.prisma.productPricing.create({
        data: {
          productId,
          costPrice: product.price * 0.7, // Giả định giá nhập = 70% giá bán hiện tại
        },
        include: { product: { select: { name: true, price: true } } }
      });
    }
    return pricing;
  }

  /**
   * Tính toán giá bán dựa trên cấu hình
   */
  async calculatePrice(dto: CalculatePricingDto) {
    const config = await this.getConfig();
    const {
      costPrice,
      lossRate = 0.05,
      customProfitMargin,
      manualPrice
    } = dto;

    const taxRate = config.defaultTaxRate;
    const profitMargin = customProfitMargin ?? config.defaultProfitMargin;

    // 1. Nếu nhập giá thủ công
    if (manualPrice && manualPrice > 0) {
      // Tính toán breakdown dựa trên giá thủ công
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

    // 2. Tính toán tự động theo công thức Margin-based
    // S = EC / (1 - (ProfitMargin + TaxRate))
    const effectiveCost = costPrice / (1 - lossRate);
    const totalVariableRates = profitMargin + taxRate;

    if (totalVariableRates >= 1) {
      throw new BadRequestException('Tổng tỷ lệ lợi nhuận và thuế không được vượt quá 100%');
    }

    let suggestedPrice = effectiveCost / (1 - totalVariableRates);

    // Làm tròn giá đến hàng nghìn gần nhất
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

  /**
   * Cập nhật và áp dụng giá mới cho sản phẩm
   */
  async updateProductPricing(productId: number, dto: CalculatePricingDto) {
    const result = await this.calculatePrice(dto);

    // Lưu cấu hình pricing
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

    // Cập nhật giá bán chính thức vào bảng Product
    await this.prisma.product.update({
      where: { id: productId },
      data: { price: result.suggestedPrice }
    });

    return result;
  }
}
