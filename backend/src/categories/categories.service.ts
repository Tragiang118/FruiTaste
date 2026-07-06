import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany();
  }

  findOne(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  create(dto: CreateCategoryDto) {
    const { image, imageUrl, ...rest } = dto;
    const finalImageUrl = imageUrl || image;
    if (!finalImageUrl) {
      throw new BadRequestException('Hình ảnh danh mục không được để trống');
    }
    return this.prisma.category.create({
      data: {
        ...rest,
        imageUrl: finalImageUrl,
      },
    });
  }

  update(id: number, dto: UpdateCategoryDto) {
    const { image, imageUrl, ...rest } = dto;
    const updateData: Prisma.CategoryUpdateInput = { ...rest };
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    } else if (image !== undefined) {
      updateData.imageUrl = image;
    }

    return this.prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  remove(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
