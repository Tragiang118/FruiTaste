import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Tên danh mục phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  name: string;

  @IsString({ message: 'Mô tả danh mục phải là chuỗi' })
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @MaxLength(300, { message: 'Mô tả không được vượt quá 300 ký tự' })
  description: string;

  @IsString({ message: 'Đường dẫn hình ảnh (imageUrl) phải là chuỗi' })
  @IsOptional()
  imageUrl?: string;

  @IsString({ message: 'Hình ảnh (image) phải là chuỗi' })
  @IsOptional()
  image?: string;
}
