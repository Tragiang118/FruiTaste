import { IsInt, IsNotEmpty, IsOptional, IsString, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ImportItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsOptional()
  importPrice?: number;
}

export class ImportInventoryDto {
  @IsString()
  @IsOptional()
  note?: string;

  @ValidateNested({ each: true })
  @Type(() => ImportItemDto)
  @IsNotEmpty()
  items: ImportItemDto[];
}
