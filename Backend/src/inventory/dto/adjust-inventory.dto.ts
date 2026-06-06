import { IsInt, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export class AdjustInventoryDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @IsNotEmpty()
  quantity: number; // Có thể âm nếu giảm kho

  @IsString()
  @IsOptional()
  reason?: string;
}
