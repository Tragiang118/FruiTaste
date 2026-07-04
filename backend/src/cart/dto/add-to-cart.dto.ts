import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddToCartDto {
  @IsInt({ message: 'productId phải là số nguyên' })
  @IsNotEmpty({ message: 'productId không được để trống' })
  productId: number;

  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải lớn hơn hoặc bằng 1' })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  quantity: number;
}
