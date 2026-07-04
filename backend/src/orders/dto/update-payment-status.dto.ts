import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePaymentStatusDto {
  @IsString()
  @IsNotEmpty({ message: 'Trạng thái thanh toán không được để trống' })
  status: string;
}
