import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.product.findMany({
      where: { isActive: true, isDeleted: false },
      include: {
        categories: true,
        inventory: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        categories: true,
        inventory: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { categories: true, inventory: true },
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    return product;
  }

  async create(data: any) {
    const { categoryIds, ...rest } = data;
    // Bỏ stockQuantity từ rest nếu có, vì ta sẽ mặc định là 0
    const { stockQuantity, ...productData } = rest;

    return this.prisma.product.create({
      data: {
        ...productData,
        stockQuantity: 0,
        categories: categoryIds?.length
          ? { connect: categoryIds.map((id: number) => ({ id })) }
          : undefined,
        inventory: {
          create: {
            currentStock: 0,
            lowStockThreshold: 10,
            lastImportDate: null,
          }
        }
      },
      include: { categories: true, inventory: true },
    });
  }

  async update(id: number, data: any) {
    // Chỉ lấy các trường hợp lệ của Product để update
    const {
      name, description, price, unit, mediaUrls,
      isActive, healthInfo, tags, categoryIds
    } = data;

    return this.prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        unit,
        mediaUrls,
        isActive,
        healthInfo,
        tags,
        categories: categoryIds
          ? { set: categoryIds.map((catId: number) => ({ id: catId })) }
          : undefined,
      },
      include: { categories: true },
    });
  }

  async remove(id: number) {
    return this.prisma.product.update({
      where: { id },
      data: { 
        isDeleted: true,
        isActive: false 
      },
    });
  }
}
