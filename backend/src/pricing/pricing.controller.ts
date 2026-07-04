import { Controller, Get, Post, Body, Param, Put, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CalculatePricingDto, UpdatePricingConfigDto } from './dto/pricing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('pricing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('config')
  getConfig() {
    return this.pricingService.getConfig();
  }

  @Put('config')
  updateConfig(@Body() dto: UpdatePricingConfigDto) {
    return this.pricingService.updateConfig(dto);
  }

  @Get('product/:id')
  getProductPricing(@Param('id', ParseIntPipe) id: number) {
    return this.pricingService.getProductPricing(id);
  }

  @Post('calculate')
  calculatePrice(@Body() dto: CalculatePricingDto) {
    return this.pricingService.calculatePrice(dto);
  }

  @Post('apply/:id')
  applyPrice(@Param('id', ParseIntPipe) id: number, @Body() dto: CalculatePricingDto) {
    return this.pricingService.updateProductPricing(id, dto);
  }
}
