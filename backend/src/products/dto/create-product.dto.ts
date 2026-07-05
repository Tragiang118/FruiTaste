import { IsString, IsNotEmpty, IsNumber, Min, IsInt, IsOptional, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Mô tả sản phẩm không được để trống' })
  description: string;

  @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
  @Min(1000, { message: 'Giá sản phẩm tối thiểu là 1.000 VNĐ' })
  @IsNotEmpty({ message: 'Giá sản phẩm không được để trống' })
  price: number;

  @IsString()
  @IsNotEmpty({ message: 'Đơn vị tính không được để trống' })
  unit: string;

  @IsInt({ message: 'Số lượng tồn kho phải là số nguyên' })
  @Min(0, { message: 'Số lượng tồn kho không được nhỏ hơn 0' })
  @IsOptional()
  stockQuantity?: number;

  @IsArray({ message: 'mediaUrls phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi URL hình ảnh phải là một chuỗi' })
  @IsNotEmpty({ message: 'Hình ảnh/Video sản phẩm không được để trống' })
  mediaUrls: string[];

  @IsString()
  @IsNotEmpty({ message: 'Thông tin sức khỏe/dinh dưỡng không được để trống' })
  healthInfo: string;

  @IsArray({ message: 'tags phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi tag phải là một chuỗi' })
  @IsOptional()
  tags?: string[];

  @IsArray({ message: 'categoryIds phải là một mảng' })
  @IsInt({ each: true, message: 'Mỗi ID danh mục phải là số nguyên' })
  @IsOptional()
  categoryIds?: number[];
}
