import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Require Auth
// AdminGuard có thể tạo về sau, tạm cho Protect Token
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('admin')
  findAllAdmin() {
    return this.productsService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createData: any) {
    return this.productsService.create({
      name: createData.name,
      description: createData.description,
      price: createData.price,
      unit: createData.unit,
      stockQuantity: createData.stockQuantity,
      mediaUrls: createData.mediaUrls,
      categoryIds: createData.categoryIds,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateData: any) {
    return this.productsService.update(id, {
      name: updateData.name,
      description: updateData.description,
      price: updateData.price,
      unit: updateData.unit,
      stockQuantity: updateData.stockQuantity,
      mediaUrls: updateData.mediaUrls,
      isActive: updateData.isActive,
      categoryIds: updateData.categoryIds,
      healthInfo: updateData.healthInfo,
      tags: updateData.tags,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
