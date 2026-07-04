import {
  Body,
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Res,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmailToken(dto.token);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.verifyOtp(dto.email, dto.otp);
    const isSecure = process.env.NODE_ENV === 'production' || process.env.FRONTEND_URL?.startsWith('https');
    
    const cookieOptions: any = {
      httpOnly: true,
      path: '/',
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };
    if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.includes('fruitaste.page')) {
      cookieOptions.domain = '.fruitaste.page';
    }

    // Set cookie đăng nhập tạm thời
    response.cookie('Authentication', result.access_token, cookieOptions);
    return { user: result.user, mustChangePassword: result.mustChangePassword };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) response: Response) {
    const { access_token } = await this.authService.login(req.user);
    const isSecure = process.env.NODE_ENV === 'production' || process.env.FRONTEND_URL?.startsWith('https');
    
    const cookieOptions: any = {
      httpOnly: true,
      path: '/',
      secure: isSecure,
      sameSite: 'lax', // for localhost
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };
    if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.includes('fruitaste.page')) {
      cookieOptions.domain = '.fruitaste.page';
    }

    response.cookie('Authentication', access_token, cookieOptions);
    return { ...req.user, mustChangePassword: req.user.mustChangePassword || false };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    const isSecure = process.env.NODE_ENV === 'production' || process.env.FRONTEND_URL?.startsWith('https');
    
    const cookieOptions: any = {
      httpOnly: true,
      path: '/',
      secure: isSecure,
      sameSite: 'lax',
    };
    if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.includes('fruitaste.page')) {
      cookieOptions.domain = '.fruitaste.page';
    }

    // Clear cookies consistently
    response.clearCookie('Authentication', cookieOptions);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}

