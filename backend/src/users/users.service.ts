import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import * as crypto from 'crypto';
import { Cron, CronExpression } from '@nestjs/schedule';

import * as bcrypt from 'bcrypt';
import disposableDomains from 'disposable-email-domains';

const DISPOSABLE_DOMAIN_SET = new Set(disposableDomains);

@Injectable()
export class UsersService {
    async create(dto: CreateUserDto) {
      // 1. Kiểm tra Email rác / Email tạm thời
      if (dto.email) {
        const domain = dto.email.split('@')[1]?.toLowerCase();
        if (domain && DISPOSABLE_DOMAIN_SET.has(domain)) {
          throw new BadRequestException('Hệ thống không cho phép đăng ký bằng Email rác / Email tạm thời!');
        }
      }

      try {
        // Hash password bằng bcrypt
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        return await this.prisma.user.create({
          data: {
            email: dto.email,
            password: hashedPassword,
            fullName: dto.fullName,
            phone: dto.phone,
            avatar: dto.avatar,
            role: dto.role || Role.USER,
            isEmailVerified: dto.isEmailVerified ?? true,
            verificationToken: dto.verificationToken,
          },
        });
      } catch (error: any) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email đã tồn tại. Vui lòng sử dụng email khác.');
        }
        throw error;
      }
    }
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanUpUnverifiedAccounts() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      const result = await this.prisma.user.deleteMany({
        where: {
          isEmailVerified: false,
          createdAt: { lt: sevenDaysAgo },
          role: 'USER', // Chỉ tự động xóa tài khoản khách hàng để tránh rủi ro
        },
      });

      if (result.count > 0) {
        console.log(`[Cron] Hệ thống đã dọn dẹp ${result.count} tài khoản rác (chưa xác thực email quá 7 ngày).`);
      }
    } catch (error) {
      console.error('[Cron] Lỗi khi dọn dẹp tài khoản rác:', error);
    }
  }

  // Tìm user đã xác thực với token cũ (đã dùng)
  async findByVerificationTokenUsed(token: string) {
	return this.prisma.user.findFirst({
      where: {
        isEmailVerified: true,
        verificationToken: null,
        // Có thể lưu token đã dùng vào trường khác nếu muốn kiểm tra sâu hơn
      },
    });
  }

  async findOne(email: string) {
    return this.prisma.user.findFirst({
      where: { 
        email,
        deletedAt: null 
      },
    });
  }

  async findDeletedByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email: {
          startsWith: `${email}.del.`
        },
        deletedAt: { not: null }
      },
      orderBy: { deletedAt: 'desc' } // Lấy bản ghi bị xóa gần nhất
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { addresses: true }
    });
  }

  async findByVerificationToken(token: string) {
    return this.prisma.user.findFirst({
      where: { verificationToken: token },
    });
  }

  async verifyUserEmail(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    const updateData: any = {
      isEmailVerified: true,
      verificationToken: null,
    };

    // Nếu có email đang chờ xác nhận, cập nhật nó thành email chính
    if (user?.pendingEmail) {
      updateData.email = user.pendingEmail;
      updateData.pendingEmail = null;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async requestEmailChange(id: number, newEmail: string) {
    // Kiểm tra email mới có bị trùng không
    const existingUser = await this.prisma.user.findUnique({
      where: { email: newEmail }
    });
    
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng bởi tài khoản khác');
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
  async lockUser(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async unlockUser(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async softDeleteUser(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) return null;

      // Giải phóng email bằng cách thêm hậu tố để người dùng có thể đăng ký lại nếu muốn
      const maskedEmail = `${user.email}.del.${Date.now()}`;

      return await this.prisma.user.update({
        where: { id },
        data: { 
          deletedAt: new Date(),
          isActive: false,
          email: maskedEmail
        },
      });
    } catch (error) {
      console.error('DEBUG: Soft Delete Error:', error);
      throw error;
    }
  }
  async changeRole(id: number, role: Role) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    // Không cho phép cập nhật password trực tiếp qua hàm update chung
    // Lọc bỏ các trường liên quan đến đổi mật khẩu do frontend gửi thừa
    const { password, oldPassword, newPassword, confirmPassword, ...updateData } = data as any;
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại');

    if (!user.password) {
      throw new UnauthorizedException('Tài khoản này không sử dụng mật khẩu (có thể đăng nhập qua mạng xã hội)');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác');
    }

    // Kiểm tra mật khẩu mới có trùng mật khẩu cũ không
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu hiện tại');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword, mustChangePassword: false },
    });
  }

  async saveResetOtp(email: string, hashedOtp: string, expiry: Date) {
    return this.prisma.user.update({
      where: { email },
      data: {
        resetOtp: hashedOtp,
        resetOtpExpiry: expiry,
        otpAttempts: 0,
      },
    });
  }

  async clearResetOtp(email: string) {
    return this.prisma.user.update({
      where: { email },
      data: {
        resetOtp: null,
        resetOtpExpiry: null,
        otpAttempts: 0,
      },
    });
  }

  async incrementOtpAttempts(email: string) {
    return this.prisma.user.update({
      where: { email },
      data: {
        otpAttempts: { increment: 1 },
      },
    });
  }

  async setMustChangePassword(id: number, value: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { mustChangePassword: value },
    });
  }

  async forceChangePassword(id: number, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại');

    // Kiểm tra mật khẩu mới có trùng mật khẩu cũ không (nếu có mật khẩu cũ)
    if (user.password) {
      const isSameAsOld = await bcrypt.compare(newPassword, user.password);
      if (isSameAsOld) {
        throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu hiện tại');
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

  async getAddresses(userId: number) {
    return this.prisma.address.findMany({
      where: { userId },
    });
  }

  async addAddress(userId: number, data: CreateAddressDto) {
    // 1. Kiểm tra số lượng địa chỉ hiện tại (Tối đa 5)
    const currentAddresses = await this.prisma.address.count({
      where: { userId }
    });

    if (currentAddresses >= 5) {
      throw new ConflictException('Bạn chỉ có thể lưu tối đa 5 địa chỉ.');
    }

    // 2. Nếu địa chỉ mới là mặc định, reset các địa chỉ cũ
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    // 3. Tạo địa chỉ mới
    return this.prisma.address.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async deleteAddress(userId: number, addressId: number) {
    return this.prisma.address.deleteMany({
      where: {
        id: addressId,
        userId,
      },
    });
  }

  async updateAddress(userId: number, addressId: number, data: UpdateAddressDto) {
    // Nếu đặt làm mặc định, reset các địa chỉ khác
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    return this.prisma.address.update({
      where: { 
        id: addressId,
        userId // Đảm bảo đúng user sở hữu địa chỉ này
      },
      data,
    });
  }

  async setDefaultAddress(userId: number, addressId: number) {
    // 1. Reset all addresses to non-default
    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    // 2. Set the chosen address as default
    return this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true }
    });
  }

  async updateAvatar(userId: number, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });
  }
}
