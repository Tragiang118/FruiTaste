import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  @Matches(/[A-Z]/, { message: 'Mật khẩu mới phải có ít nhất 1 chữ in hoa' })
  @Matches(/[a-z]/, { message: 'Mật khẩu mới phải có ít nhất 1 chữ in thường' })
  @Matches(/[0-9]/, { message: 'Mật khẩu mới phải có ít nhất 1 chữ số' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt' })
  newPassword: string;
}

export class ForceChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  @Matches(/[A-Z]/, { message: 'Mật khẩu mới phải có ít nhất 1 chữ in hoa' })
  @Matches(/[a-z]/, { message: 'Mật khẩu mới phải có ít nhất 1 chữ in thường' })
  @Matches(/[0-9]/, { message: 'Mật khẩu mới phải có ít nhất 1 chữ số' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt' })
  newPassword: string;
}
