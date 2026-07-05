import { IsString, IsNotEmpty, IsInt, Min, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsInt({ message: 'productId phải là số nguyên' })
  @IsNotEmpty({ message: 'productId không được để trống' })
  productId: number;

  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  quantity: number;

  @IsNumber()
  @IsOptional()
  priceAtPurchase?: number;

  @IsNumber()
  @IsOptional()
  price?: number;
}

export class CreateOrderDto {
  @IsArray({ message: 'items phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty({ message: 'Danh sách sản phẩm không được để trống' })
  items: OrderItemDto[];

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  shippingName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  shippingPhone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @IsNumber()
  @IsOptional()
  shippingFee?: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
