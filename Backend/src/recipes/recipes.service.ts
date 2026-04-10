import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.recipe.findMany();
  }

  findOne(id: number) {
    return this.prisma.recipe.findUnique({
      where: { id },
    });
  }
}
