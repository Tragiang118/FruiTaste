import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus, { message: 'Trạng thái thanh toán không hợp lệ' })
  @IsNotEmpty({ message: 'Trạng thái thanh toán không được để trống' })
  status: PaymentStatus;
}
