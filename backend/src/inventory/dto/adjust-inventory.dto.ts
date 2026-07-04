import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AdjustInventoryDto {
  @IsInt({ message: 'productId phải là số nguyên' })
  @IsNotEmpty({ message: 'productId không được để trống' })
  productId: number;

  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  quantity: number; // Có thể âm nếu giảm kho

  @IsString()
  @IsNotEmpty({ message: 'Lý do điều chỉnh kho không được để trống' })
  reason: string;
}
