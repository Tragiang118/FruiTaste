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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
const schedule_1 = require("@nestjs/schedule");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    async create(dto) {
        try {
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            return await this.prisma.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword,
                    fullName: dto.fullName,
                    phone: dto.phone,
                    avatar: dto.avatar,
                    role: dto.role || client_1.Role.USER,
                    isEmailVerified: dto.isEmailVerified ?? true,
                    verificationToken: dto.verificationToken,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Email đã tồn tại. Vui lòng sử dụng email khác.');
            }
            throw error;
        }
    }
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleCleanUpUnverifiedAccounts() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        try {
            const result = await this.prisma.user.deleteMany({
                where: {
                    isEmailVerified: false,
                    createdAt: { lt: sevenDaysAgo },
                    role: 'USER',
                },
            });
            if (result.count > 0) {
                console.log(`[Cron] Hệ thống đã dọn dẹp ${result.count} tài khoản rác (chưa xác thực email quá 7 ngày).`);
            }
        }
        catch (error) {
            console.error('[Cron] Lỗi khi dọn dẹp tài khoản rác:', error);
        }
    }
    async findByVerificationTokenUsed(token) {
        return this.prisma.user.findFirst({
            where: {
                isEmailVerified: true,
                verificationToken: null,
            },
        });
    }
    async findOne(email) {
        return this.prisma.user.findFirst({
            where: {
                email,
                deletedAt: null
            },
        });
    }
    async findDeletedByEmail(email) {
        return this.prisma.user.findFirst({
            where: {
                email: {
                    startsWith: `${email}.del.`
                },
                deletedAt: { not: null }
            },
            orderBy: { deletedAt: 'desc' }
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { addresses: true }
        });
    }
    async findByVerificationToken(token) {
        return this.prisma.user.findFirst({
            where: { verificationToken: token },
        });
    }
    async verifyUserEmail(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        const updateData = {
            isEmailVerified: true,
            verificationToken: null,
        };
        if (user?.pendingEmail) {
            updateData.email = user.pendingEmail;
            updateData.pendingEmail = null;
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
        });
    }
    async requestEmailChange(id, newEmail) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: newEmail }
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email đã được sử dụng bởi tài khoản khác');
        }
        const verificationToken = crypto.randomBytes(32).toString('hex');
        return this.prisma.user.update({
            where: { id },
            data: {
                pendingEmail: newEmail,
                verificationToken: verificationToken,
            },
        });
    }
    async findAll() {
        const users = await this.prisma.user.findMany({
            where: { deletedAt: null },
        });
        console.log('Found users:', users);
        return users;
    }
    async lockUser(id) {
        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async unlockUser(id) {
        return this.prisma.user.update({
            where: { id },
            data: { isActive: true },
        });
    }
    async softDeleteUser(id) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (!user)
                return null;
            const maskedEmail = `${user.email}.del.${Date.now()}`;
            return await this.prisma.user.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                    isActive: false,
                    email: maskedEmail
                },
            });
        }
        catch (error) {
            console.error('DEBUG: Soft Delete Error:', error);
            throw error;
        }
    }
    async changeRole(id, role) {
        return this.prisma.user.update({
            where: { id },
            data: { role },
        });
    }
    async update(id, data) {
        const { password, oldPassword, newPassword, confirmPassword, ...updateData } = data;
        return this.prisma.user.update({
            where: { id },
            data: updateData,
        });
    }
    async changePassword(id, oldPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.UnauthorizedException('Người dùng không tồn tại');
        if (!user.password) {
            throw new common_1.UnauthorizedException('Tài khoản này không sử dụng mật khẩu (có thể đăng nhập qua mạng xã hội)');
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Mật khẩu cũ không chính xác');
        }
        const isSameAsOld = await bcrypt.compare(newPassword, user.password);
        if (isSameAsOld) {
            throw new common_1.BadRequestException('Mật khẩu mới không được trùng với mật khẩu hiện tại');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword, mustChangePassword: false },
        });
    }
    async saveResetOtp(email, hashedOtp, expiry) {
        return this.prisma.user.update({
            where: { email },
            data: {
                resetOtp: hashedOtp,
                resetOtpExpiry: expiry,
                otpAttempts: 0,
            },
        });
    }
    async clearResetOtp(email) {
        return this.prisma.user.update({
            where: { email },
            data: {
                resetOtp: null,
                resetOtpExpiry: null,
                otpAttempts: 0,
            },
        });
    }
    async incrementOtpAttempts(email) {
        return this.prisma.user.update({
            where: { email },
            data: {
                otpAttempts: { increment: 1 },
            },
        });
    }
    async setMustChangePassword(id, value) {
        return this.prisma.user.update({
            where: { id },
            data: { mustChangePassword: value },
        });
    }
    async forceChangePassword(id, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.UnauthorizedException('Người dùng không tồn tại');
        if (user.password) {
            const isSameAsOld = await bcrypt.compare(newPassword, user.password);
            if (isSameAsOld) {
                throw new common_1.BadRequestException('Mật khẩu mới không được trùng với mật khẩu hiện tại');
            }
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return this.prisma.user.update({
            where: { id },
            data: {
                password: hashedPassword,
                mustChangePassword: false,
            },
        });
    }
    async getAddresses(userId) {
        return this.prisma.address.findMany({
            where: { userId },
        });
    }
    async addAddress(userId, data) {
        const currentAddresses = await this.prisma.address.count({
            where: { userId }
        });
        if (currentAddresses >= 5) {
            throw new common_1.ConflictException('Bạn chỉ có thể lưu tối đa 5 địa chỉ.');
        }
        if (data.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }
        return this.prisma.address.create({
            data: {
                ...data,
                userId,
            },
        });
    }
    async deleteAddress(userId, addressId) {
        return this.prisma.address.deleteMany({
            where: {
                id: addressId,
                userId,
            },
        });
    }
    async updateAddress(userId, addressId, data) {
        if (data.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }
        return this.prisma.address.update({
            where: {
                id: addressId,
                userId
            },
            data,
        });
    }
    async setDefaultAddress(userId, addressId) {
        await this.prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false }
        });
        return this.prisma.address.update({
            where: { id: addressId },
            data: { isDefault: true }
        });
    }
    async updateAvatar(userId, avatarUrl) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
        });
    }
};
exports.UsersService = UsersService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersService.prototype, "handleCleanUpUnverifiedAccounts", null);
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map