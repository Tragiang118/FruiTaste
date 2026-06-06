import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      // Kiểm tra xem có tài khoản nào đã bị xóa trước đó không
      const deletedUser = await this.usersService.findDeletedByEmail(email);
      if (deletedUser) {
        throw new BadRequestException('Tài khoản này đã bị xóa bởi Quản trị viên. Bạn có thể đăng ký tài khoản mới bằng email này.');
      }
      throw new BadRequestException('Email không tồn tại trên hệ thống');
    }

    // 1. Tạo OTP 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Hash OTP trước khi lưu vào DB
    const hashedOtp = await bcrypt.hash(otp, 10);

    // 3. Thời hạn OTP: 5 phút
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    // 4. Lưu OTP hash và thời hạn vào DB
    await this.usersService.saveResetOtp(email, hashedOtp, expiry);

    // 5. Gửi email chứa OTP
    try {
      await this.mailService.sendOtpEmail(email, otp);
    } catch (error) {
      throw new BadRequestException('Không thể gửi email OTP. Vui lòng thử lại sau hoặc liên hệ admin.');
    }

    return { message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hòm thư.' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new BadRequestException('Email hoặc mã OTP không hợp lệ.');
    }

    // Kiểm tra OTP đã tồn tại chưa
    if (!user.resetOtp || !user.resetOtpExpiry) {
      throw new BadRequestException('Không tìm thấy yêu cầu khôi phục mật khẩu. Vui lòng yêu cầu gửi lại OTP.');
    }

    // Kiểm tra OTP đã hết hạn chưa
    if (new Date() > user.resetOtpExpiry) {
      await this.usersService.clearResetOtp(email);
      throw new BadRequestException('Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.');
    }

    // So sánh OTP
    const isMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!isMatch) {
      throw new BadRequestException('Mã OTP không chính xác.');
    }

    // OTP hợp lệ → Xoá OTP, đặt mustChangePassword = true
    await this.usersService.clearResetOtp(email);
    await this.usersService.setMustChangePassword(user.id, true);

    // Tạo JWT token để đăng nhập tạm thời
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      fullName: user.fullName,
    };

    const access_token = this.jwtService.sign(payload);
    const { password, resetOtp, resetOtpExpiry, ...userInfo } = user as any;

    return {
      access_token,
      user: { ...userInfo, mustChangePassword: true },
      mustChangePassword: true,
    };
  }

  async verifyEmailToken(token: string) {
    if (!token) {
      throw new BadRequestException('Token không hợp lệ');
    }
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException(
        'Link xác thực không hợp lệ hoặc đã được sử dụng. Vui lòng đăng nhập nếu bạn đã xác thực trước đó.',
      );
    }

    await this.usersService.verifyUserEmail(user.id);
    return { message: 'Xác thực email thành công' };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);

    if (!user) {
      // Kiểm tra xem có tài khoản nào đã bị xóa trước đó không
      const deletedUser = await this.usersService.findDeletedByEmail(email);
      if (deletedUser) {
        throw new UnauthorizedException('Tài khoản này đã bị xóa bởi Quản trị viên. Bạn có thể đăng ký tài khoản mới bằng email này.');
      }
      throw new UnauthorizedException('Email không tồn tại trên hệ thống');
    }

    if (!user.password) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // So sánh mật khẩu gốc với mật khẩu đã hash trong DB
    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Tài khoản này đã bị xóa khỏi hệ thống.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Vui lòng xác thực email của bạn trước khi đăng nhập',
      );
    }

    const { password, ...result } = user;
    return result;
  }

  async getProfile(id: number) {
    const user = await this.usersService.findById(id);
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
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

  async register(user: any) {
    // Không cần hash ở đây nữa vì UsersService.create đã thực hiện hash rồi

    // Tạo token dài 32 bytes ngẫu nhiên cho việc xác thực email
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await this.usersService.create({
      email: user.email,
      password: user.password,
      fullName: user.fullName,
      role: 'USER',
      isEmailVerified: false,
      verificationToken: verificationToken,
    });

    // Gửi email xác thực
    try {
      await this.mailService.sendVerificationEmail(
        newUser.email,
        newUser.fullName || 'Người dùng',
        verificationToken
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Vẫn cho phép đăng ký thành công, người dùng có thể yêu cầu gửi lại sau hoặc Admin kích hoạt
    }

    const { password, ...result } = newUser;
    return result;
  }
}
