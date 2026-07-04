import { Controller, Get, Post, Body, UseGuards, Query, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ImportInventoryDto } from './dto/import-inventory.dto';
import { ExportInventoryDto } from './dto/export-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async getList() {
    return this.inventoryService.getInventoryList();
  }

  @Get('low-stock')
  async getLowStock() {
    return this.inventoryService.getLowStock();
  }

  @Get('transactions')
  async getTransactions(@Query('limit') limit?: string) {
    return this.inventoryService.getTransactions(limit ? parseInt(limit) : 100);
  }

  @Get('import/:id')
  async getImportReceipt(@Param('id') id: string) {
    return this.inventoryService.getImportReceipt(parseInt(id));
  }

  @Get('export/:id')
  async getExportReceipt(@Param('id') id: string) {
    return this.inventoryService.getExportReceipt(parseInt(id));
  }

  @Post('import')
  async import(@Body() dto: ImportInventoryDto) {
    return this.inventoryService.importProducts(dto);
  }

  @Post('export')
  async export(@Body() dto: ExportInventoryDto) {
    return this.inventoryService.exportProducts(dto);
  }

  @Post('adjust')
  async adjust(@Body() dto: AdjustInventoryDto) {
    return this.inventoryService.adjustStock(dto);
  }
}

