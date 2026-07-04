import { IsString, IsNotEmpty, IsInt, Min, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsInt({ message: 'productId phải là số nguyên' })
  @IsNotEmpty({ message: 'productId không được để trống' })
  productId: number;

  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  quantity: number;
}

export class CreateOrderDto {
  @IsArray({ message: 'items phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty({ message: 'Danh sách sản phẩm không được để trống' })
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty({ message: 'Họ tên người nhận không được để trống' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại người nhận không được để trống' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ giao hàng không được để trống' })
  address: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
