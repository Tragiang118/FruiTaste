import { IsEmail, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
	@IsEmail()
	email: string;

	@IsString()
	@MinLength(6)
	password: string;

	@IsString()
	@IsOptional()
	fullName?: string;

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
