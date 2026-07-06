import { IsString, IsNotEmpty, IsNumber, Min, Max, IsInt, IsOptional, IsArray, ArrayMinSize } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @IsString({ message: 'Mô tả sản phẩm phải là chuỗi' })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
  @Min(1000, { message: 'Giá phải từ 1,000 VNĐ' })
  @Max(3000000, { message: 'Giá tối đa 3,000,000 VNĐ' })
  @IsNotEmpty({ message: 'Giá không được để trống' })
  price: number;

  @IsString({ message: 'Đơn vị tính phải là chuỗi' })
  @IsNotEmpty({ message: 'Đơn vị không được để trống' })
  unit: string;

  @IsInt({ message: 'Số lượng tồn kho phải là số nguyên' })
  @Min(0, { message: 'Số lượng tồn kho không được nhỏ hơn 0' })
  @IsOptional()
  stockQuantity?: number;

  @IsArray({ message: 'mediaUrls phải là một mảng' })
  @ArrayMinSize(1, { message: 'Cần ít nhất 1 ảnh hoặc video cho sản phẩm' })
  @IsString({ each: true, message: 'Mỗi URL hình ảnh/video phải là một chuỗi' })
  mediaUrls: string[];

  @IsString({ message: 'Thông tin sức khỏe phải là chuỗi' })
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
