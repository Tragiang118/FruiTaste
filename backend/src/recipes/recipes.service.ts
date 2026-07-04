import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.recipe.findMany({
      include: {
        ingredients: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            product: true
          }
        }
      }
    });
    if (!recipe) throw new NotFoundException(`Recipe with ID ${id} not found`);
    return recipe;
  }

  async create(createRecipeDto: CreateRecipeDto) {
    const { ingredients, ...recipeData } = createRecipeDto;
    return this.prisma.recipe.create({
      data: {
        ...recipeData,
        ingredients: {
          create: ingredients
        }
      },
      include: {
        ingredients: true
      }
    });
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto) {
    const { ingredients, ...recipeData } = updateRecipeDto;
    
    // Check if exists
    await this.findOne(id);

    return this.prisma.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        ingredients: ingredients ? {
          deleteMany: {}, // Xóa sạch để tạo lại (đơn giản nhất cho CRUD ingredients)
          create: ingredients
        } : undefined
      },
      include: {
        ingredients: true
      }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.recipe.delete({
      where: { id }
    });
  }
}
