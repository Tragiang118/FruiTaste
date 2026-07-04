import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private mailService;
    constructor(usersService: UsersService, jwtService: JwtService, mailService: MailService);
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    verifyOtp(email: string, otp: string): Promise<{
        access_token: string;
        user: any;
        mustChangePassword: boolean;
    }>;
    verifyEmailToken(token: string): Promise<{
        message: string;
    }>;
    validateUser(email: string, pass: string): Promise<any>;
    getProfile(id: number): Promise<{
        addresses: {
            phone: string;
            id: number;
            userId: number;
            recipientName: string;
            fullAddress: string;
            label: string | null;
            isDefault: boolean;
        }[];
        email: string;
        fullName: string | null;
        phone: string | null;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        verificationToken: string | null;
        pendingEmail: string | null;
        resetOtp: string | null;
        resetOtpExpiry: Date | null;
        otpAttempts: number;
        mustChangePassword: boolean;
        isActive: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    } | null>;
    login(user: any): Promise<{
        access_token: string;
    }>;
    register(user: any): Promise<{
        email: string;
        fullName: string | null;
        phone: string | null;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        verificationToken: string | null;
        pendingEmail: string | null;
        resetOtp: string | null;
        resetOtpExpiry: Date | null;
        otpAttempts: number;
        mustChangePassword: boolean;
        isActive: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
}
