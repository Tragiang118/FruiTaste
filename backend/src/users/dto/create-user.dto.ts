import { IsEmail, IsOptional, IsString, MinLength, IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
	@IsEmail({}, { message: 'Email không hợp lệ' })
	@IsNotEmpty({ message: 'Email không được để trống' })
	email: string;

	@IsString()
	@MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
	@IsNotEmpty({ message: 'Mật khẩu không được để trống' })
	password: string;

	@IsString()
	@IsNotEmpty({ message: 'Họ tên không được để trống' })
	fullName: string;

	@IsString()
	@IsOptional()
	phone?: string;

	@IsString()
	@IsOptional()
	avatar?: string;

	@IsEnum(Role)
	@IsOptional()
	role?: Role;

	@IsOptional()
	isEmailVerified?: boolean;

	@IsOptional()
	verificationToken?: string;
}
