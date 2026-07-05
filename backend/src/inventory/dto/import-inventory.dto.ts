import { IsInt, IsNotEmpty, IsOptional, IsString, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportItemDto {
  @IsInt({ message: 'productId phải là số nguyên' })
  @IsNotEmpty({ message: 'productId không được để trống' })
  productId: number;

  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  quantity: number;

  @IsNumber({}, { message: 'Giá nhập phải là số' })
  @Min(1000, { message: 'Giá nhập tối thiểu là 1.000đ' })
  @IsOptional()
  importPrice?: number;

  @IsNumber()
  @IsOptional()
  price?: number;
}

export class ImportInventoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên người/nhà cung cấp nhập kho' })
  supplier: string;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập ghi chú cho phiếu nhập kho' })
  note: string;

  @ValidateNested({ each: true })
  @Type(() => ImportItemDto)
  @IsNotEmpty({ message: 'Danh sách sản phẩm nhập kho không được để trống' })
  items: ImportItemDto[];

  @IsOptional()
  createdAt?: Date;
}
