"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const mail_service_1 = require("../mail/mail.service");
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    usersService;
    jwtService;
    mailService;
    constructor(usersService, jwtService, mailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }
    async forgotPassword(email) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            const deletedUser = await this.usersService.findDeletedByEmail(email);
            if (deletedUser) {
                throw new common_1.BadRequestException('Tài khoản này đã bị xóa bởi Quản trị viên. Bạn có thể đăng ký tài khoản mới bằng email này.');
            }
            throw new common_1.BadRequestException('Email không tồn tại trên hệ thống');
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const expiry = new Date(Date.now() + 5 * 60 * 1000);
        await this.usersService.saveResetOtp(email, hashedOtp, expiry);
        try {
            await this.mailService.sendOtpEmail(email, otp);
        }
        catch (error) {
            throw new common_1.BadRequestException('Không thể gửi email OTP. Vui lòng thử lại sau hoặc liên hệ admin.');
        }
        return { message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hòm thư.' };
    }
    async verifyOtp(email, otp) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            throw new common_1.BadRequestException('Email hoặc mã OTP không hợp lệ.');
        }
        if (!user.resetOtp || !user.resetOtpExpiry) {
            throw new common_1.BadRequestException('Không tìm thấy yêu cầu khôi phục mật khẩu. Vui lòng yêu cầu gửi lại OTP.');
        }
        if (user.otpAttempts >= 5) {
            await this.usersService.clearResetOtp(email);
            throw new common_1.BadRequestException('Bạn đã nhập sai OTP quá 5 lần. Yêu cầu khôi phục mật khẩu này đã bị hủy, vui lòng yêu cầu gửi lại mã OTP mới.');
        }
        if (new Date() > user.resetOtpExpiry) {
            await this.usersService.clearResetOtp(email);
            throw new common_1.BadRequestException('Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.');
        }
        const isMatch = await bcrypt.compare(otp, user.resetOtp);
        if (!isMatch) {
            const updatedUser = await this.usersService.incrementOtpAttempts(email);
            const remaining = 5 - updatedUser.otpAttempts;
            if (remaining <= 0) {
                await this.usersService.clearResetOtp(email);
                throw new common_1.BadRequestException('Bạn đã nhập sai OTP quá 5 lần. Yêu cầu khôi phục mật khẩu này đã bị hủy, vui lòng yêu cầu gửi lại mã OTP mới.');
            }
            throw new common_1.BadRequestException(`Mã OTP không chính xác. Bạn còn ${remaining} lần thử.`);
        }
        await this.usersService.clearResetOtp(email);
        await this.usersService.setMustChangePassword(user.id, true);
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            fullName: user.fullName,
        };
        const access_token = this.jwtService.sign(payload);
        const { password, resetOtp, resetOtpExpiry, ...userInfo } = user;
        return {
            access_token,
            user: { ...userInfo, mustChangePassword: true },
            mustChangePassword: true,
        };
    }
    async verifyEmailToken(token) {
        if (!token) {
            throw new common_1.BadRequestException('Token không hợp lệ');
        }
        const user = await this.usersService.findByVerificationToken(token);
        if (!user) {
            throw new common_1.BadRequestException('Link xác thực không hợp lệ hoặc đã được sử dụng. Vui lòng đăng nhập nếu bạn đã xác thực trước đó.');
        }
        await this.usersService.verifyUserEmail(user.id);
        return { message: 'Xác thực email thành công' };
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            const deletedUser = await this.usersService.findDeletedByEmail(email);
            if (deletedUser) {
                throw new common_1.UnauthorizedException('Tài khoản này đã bị xóa bởi Quản trị viên. Bạn có thể đăng ký tài khoản mới bằng email này.');
            }
            throw new common_1.UnauthorizedException('Email không tồn tại trên hệ thống');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }
        if (user.deletedAt) {
            throw new common_1.UnauthorizedException('Tài khoản này đã bị xóa khỏi hệ thống.');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
        }
        if (!user.isEmailVerified) {
            throw new common_1.UnauthorizedException('Vui lòng xác thực email của bạn trước khi đăng nhập');
        }
        const { password, ...result } = user;
        return result;
    }
    async getProfile(id) {
        const user = await this.usersService.findById(id);
        if (!user)
            return null;
        const { password, ...result } = user;
        return result;
    }
    async login(user) {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            fullName: user.fullName,
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async register(user) {
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const newUser = await this.usersService.create({
            email: user.email,
            password: user.password,
            fullName: user.fullName,
            role: 'USER',
            isEmailVerified: false,
            verificationToken: verificationToken,
        });
        try {
            await this.mailService.sendVerificationEmail(newUser.email, newUser.fullName || 'Người dùng', verificationToken);
        }
        catch (error) {
            console.error('Failed to send verification email:', error);
        }
        const { password, ...result } = newUser;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map