import { AuthService } from './auth.service';
import { Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(createUserDto: any): Promise<{
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
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    verifyOtp(email: string, otp: string, response: Response): Promise<{
        user: any;
        mustChangePassword: boolean;
    }>;
    login(req: any, response: Response): Promise<any>;
    logout(response: Response): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<{
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
}
