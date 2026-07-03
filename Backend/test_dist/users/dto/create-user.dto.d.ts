import { Role } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
    avatar?: string;
    role?: Role;
    isEmailVerified?: boolean;
    verificationToken?: string;
}
