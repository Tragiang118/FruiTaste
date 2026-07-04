import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty({ message: 'Trạng thái đơn hàng không được để trống' })
  status: string;
}
