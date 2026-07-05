import { IsString, IsOptional, IsInt, IsArray, ValidateNested, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecipeIngredientDto {
  @IsOptional()
  @IsInt()
  productId?: number;

  @IsOptional()
  @IsString()
  ingredientName?: string;

  @IsString()
  @IsNotEmpty({ message: 'Số lượng/đơn vị nguyên liệu không được để trống' })
  quantityStr: string;
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên món ăn không được để trống' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Mô tả ngắn không được để trống' })
  description: string;

  @IsInt({ message: 'Thời gian chuẩn bị phải là số nguyên' })
  @Min(1, { message: 'Thời gian chuẩn bị phải lớn hơn 0' })
  @IsNotEmpty({ message: 'Thời gian chuẩn bị không được để trống' })
  prepTime: number;

  @IsString()
  @IsNotEmpty({ message: 'Hướng dẫn thực hiện không được để trống' })
  instructions: string;

  @IsString()
  @IsNotEmpty({ message: 'Ảnh đại diện món ăn không được để trống' })
  imageUrl: string;

  @IsArray({ message: 'Nguyên liệu phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeIngredientDto)
  @IsNotEmpty({ message: 'Cần ít nhất một nguyên liệu' })
  ingredients: CreateRecipeIngredientDto[];
}
