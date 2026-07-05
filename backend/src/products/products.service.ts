import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async findAll(search?: string) {
    const where: Prisma.ProductWhereInput = { isActive: true, isDeleted: false };
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    return this.prisma.product.findMany({
      where,
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

  async create(dto: CreateProductDto) {
    const { categoryIds, stockQuantity, ...productData } = dto;

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

  async update(id: number, dto: UpdateProductDto) {
    const {
      name, description, price, unit, mediaUrls,
      isActive, healthInfo, tags, categoryIds
    } = dto;

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
