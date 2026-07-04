import { IsString, IsOptional, IsArray, ValidateNested, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class ExportItemDto {
  @IsInt({ message: 'productId phải là số nguyên' })
  @IsNotEmpty({ message: 'productId không được để trống' })
  productId: number;

  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  quantity: number;
}

export class ExportInventoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên người nhận/xác nhận xuất kho' })
  receiver: string;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng chọn hoặc nhập lý do xuất kho' })
  reason: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsArray({ message: 'items phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => ExportItemDto)
  @IsNotEmpty({ message: 'Danh sách sản phẩm xuất kho không được để trống' })
  items: ExportItemDto[];

  @IsOptional()
  createdAt?: Date;
}
