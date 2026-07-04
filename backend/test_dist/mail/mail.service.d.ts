import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private resendApiKey;
    constructor(configService: ConfigService);
    private sendMail;
    sendNewPassword(email: string, newPassword: string): Promise<void>;
    sendOtpEmail(email: string, otp: string): Promise<void>;
    sendVerificationEmail(email: string, fullName: string, token: string): Promise<void>;
}
