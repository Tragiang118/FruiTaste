import { Injectable, NotFoundException } from '@nestjs/common';
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
   * Tính toán giá bán dựa trên công thức Biên lợi nhuận gộp (Margin Pricing) chuẩn bán lẻ
   * - Thuế VAT: Lấy từ cấu hình DB (defaultTaxRate) — có thể thay đổi theo quy định pháp luật
   * - Bước 1: Giá vốn thực tế = Giá nhập / (1 - Tỷ lệ hao hụt)
   * - Bước 2: Giá bán chưa thuế (Net) = Giá vốn thực tế / (1 - Biên lợi nhuận mong muốn)
   * - Bước 3: Tiền thuế VAT = Giá bán chưa thuế × thuế suất
   * - Bước 4: Giá bán gợi ý (Gross) = Giá bán chưa thuế + Tiền thuế (Làm tròn lên hàng 1.000đ)
   */
  async calculatePrice(dto: CalculatePricingDto) {
    const config = await this.getConfig();
    const {
      costPrice,
      lossRate: customLossRate,
      customProfitMargin,
      manualPrice
    } = dto;

    // Hao hụt: dùng giá trị riêng của sản phẩm nếu có, ngược lại dùng mặc định toàn hệ thống
    const lossRate = customLossRate ?? config.defaultLossRate ?? 0.05;
    // Lợi nhuận: dùng giá trị riêng của sản phẩm nếu có, ngược lại dùng mặc định toàn hệ thống
    const profitMargin = customProfitMargin ?? config.defaultProfitMargin ?? 0.30;

    // 1. Trường hợp nhập giá thủ công
    if (manualPrice && manualPrice > 0) {
      const effectiveCost = costPrice / (1 - lossRate);
      const lossAmount = effectiveCost - costPrice;
      const profitAmount = manualPrice - effectiveCost;

      return {
        suggestedPrice: manualPrice,
        isManual: true,
        breakdown: {
          costPrice,
          effectiveCost,
          lossAmount,
          profitAmount,
          profitMargin: effectiveCost > 0 ? (profitAmount / effectiveCost) * 100 : 0
        }
      };
    }

    // 2. Tính toán tự động theo công thức Hộ kinh doanh cá thể (Bỏ VAT)
    // Bước 1: Giá vốn thực tế sau hao hụt
    const effectiveCost = costPrice / (1 - lossRate);
    const lossAmount = effectiveCost - costPrice;

    // Bước 2: Giá bán dự kiến theo biên lợi nhuận
    const rawPrice = effectiveCost * (1 + profitMargin);
    const profitAmount = rawPrice - effectiveCost;

    // Làm tròn giá gợi ý đến hàng nghìn (Math.ceil(rawPrice / 1000) * 1000)
    const suggestedPrice = Math.ceil(rawPrice / 1000) * 1000;

    return {
      suggestedPrice,
      isManual: false,
      breakdown: {
        costPrice,
        effectiveCost,
        lossAmount,
        profitAmount,
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
        lossRate: dto.lossRate ?? null,         // null = dùng defaultLossRate
        customProfitMargin: dto.customProfitMargin ?? null, // null = dùng defaultProfitMargin
        manualPrice: dto.manualPrice && dto.manualPrice > 0 ? dto.manualPrice : null
      },
      update: {
        costPrice: dto.costPrice,
        lossRate: dto.lossRate ?? null,
        customProfitMargin: dto.customProfitMargin ?? null,
        manualPrice: dto.manualPrice && dto.manualPrice > 0 ? dto.manualPrice : null
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
