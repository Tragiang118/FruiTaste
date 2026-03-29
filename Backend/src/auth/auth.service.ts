import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async verifyEmailToken(token: string) {
    if (!token) {
      throw new BadRequestException('Token không hợp lệ');
    }
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Link xác thực không hợp lệ hoặc đã được sử dụng');
    }

    await this.usersService.verifyUserEmail(user.id);
    return { message: 'Xác thực email thành công' };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    
    if (!user) {
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

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Vui lòng xác thực email của bạn trước khi đăng nhập');
    }

    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(user: any) {
    // TODO: Hash password before saving in production
     const salt = await bcrypt.genSalt();
     const hash = await bcrypt.hash(user.password, salt);
     user.password = hash;
    
    // Tạo token độ dài 32 bytes ngẫu nhiên cho việc xác thực email (chỉ dùng cho tài khoản mới)
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const newUser = await this.usersService.create({
        email: user.email,
        password: user.password,
        fullName: user.fullName,
        role: 'USER',
        isEmailVerified: false,
        verificationToken: verificationToken,
    });
    
    const { password, ...result } = newUser;
    return result;
  }
}