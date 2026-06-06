import { IsNumber, IsOptional, Min, Max, IsInt } from 'class-validator';

export class CalculatePricingDto {
  @IsInt()
  productId: number;

  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  lossRate?: number;



  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  customProfitMargin?: number;

  @IsNumber()
  @IsOptional()
  manualPrice?: number;
}

export class UpdatePricingConfigDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  defaultTaxRate?: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  defaultProfitMargin?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minProfitMargin?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxProfitMargin?: number;
}
