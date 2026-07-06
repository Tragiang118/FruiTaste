import { IsString, IsNotEmpty, IsInt, Min, IsArray, ValidateNested, IsOptional, IsNumber, IsIn, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsInt({ message: 'productId phải là số nguyên' })
  @IsNotEmpty({ message: 'productId không được để trống' })
  productId: number;

  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  quantity: number;

  @IsNumber({}, { message: 'Giá mua phải là số' })
  @Min(0, { message: 'Giá mua không được nhỏ hơn 0' })
  @IsOptional()
  priceAtPurchase?: number;

  @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
  @Min(0, { message: 'Giá sản phẩm không được nhỏ hơn 0' })
  @IsOptional()
  price?: number;
}

export class CreateOrderDto {
  @IsArray({ message: 'items phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty({ message: 'Danh sách sản phẩm không được để trống' })
  items: OrderItemDto[];

  @IsString({ message: 'Tên người nhận phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên người nhận không được để trống' })
  shippingName: string;

  @IsString({ message: 'Số điện thoại nhận hàng phải là chuỗi' })
  @IsNotEmpty({ message: 'Số điện thoại nhận hàng không được để trống' })
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, { message: 'Số điện thoại nhận hàng không đúng định dạng hợp lệ (VD: 0912345678)' })
  shippingPhone: string;

  @IsString({ message: 'Địa chỉ nhận hàng phải là chuỗi' })
  @IsNotEmpty({ message: 'Địa chỉ nhận hàng không được để trống' })
  shippingAddress: string;

  @IsString({ message: 'Phương thức thanh toán phải là chuỗi' })
  @IsIn(['COD', 'BANK_TRANSFER'], { message: 'Phương thức thanh toán phải là COD hoặc BANK_TRANSFER' })
  @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống' })
  paymentMethod: string;

  @IsNumber({}, { message: 'Phí giao hàng phải là số' })
  @Min(0, { message: 'Phí giao hàng không được nhỏ hơn 0' })
  @IsOptional()
  shippingFee?: number;
}
