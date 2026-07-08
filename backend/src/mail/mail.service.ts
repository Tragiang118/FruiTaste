import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private resendApiKey: string;

  constructor(private configService: ConfigService) {
    this.resendApiKey = this.configService.get<string>('RESEND_API_KEY') || '';
  }

  private async sendMail(options: { to: string; subject: string; html: string }) {
    const apiKey = this.resendApiKey || process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined in .env');
      throw new Error('Cấu hình gửi email chưa được thiết lập.');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FruiTaste <no-reply@fruitaste.page>',
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Resend API error:', errorData);
      throw new Error('Không thể gửi email qua Resend.');
    }

    return response.json();
  }


  async sendOtpEmail(email: string, otp: string) {
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">🍊 FruiTaste</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Khôi phục mật khẩu</p>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #333; font-size: 15px; margin: 0 0 16px;">Xin chào,</p>
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản FruiTaste của bạn. 
            Vui lòng sử dụng mã OTP bên dưới để xác thực:
          </p>
          <div style="background: #FFF3E0; border: 2px dashed #FF6B4A; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
            <p style="margin: 0 0 8px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Mã xác thực OTP</p>
            <p style="margin: 0; font-size: 36px; font-weight: 800; color: #FF6B4A; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
          </div>
          <div style="background: #FFF8E1; border-radius: 8px; padding: 12px 16px; margin: 0 0 24px;">
            <p style="margin: 0; color: #F57C00; font-size: 13px; font-weight: 600;">
              ⏰ Mã OTP có hiệu lực trong <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.
            </p>
          </div>
          <p style="color: #999; font-size: 12px; margin: 0; line-height: 1.5;">
            Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
          </p>
        </div>
        <div style="background: #FAFAFA; padding: 16px 24px; text-align: center; border-top: 1px solid #f0f0f0;">
          <p style="margin: 0; color: #bbb; font-size: 11px;">© 2026 FruiTaste. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await this.sendMail({
        to: email,
        subject: 'Mã xác thực OTP - FruiTaste',
        html,
      });
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Không thể gửi email OTP.');
    }
  }

  async sendVerificationEmail(email: string, fullName: string, token: string) {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
        <div style="background: #22C55E; padding: 40px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">🍊 FruiTaste</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 15px; font-medium">Chào mừng bạn gia nhập gia đình trái cây!</p>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 16px;">Xin chào ${fullName},</h2>
          <p style="color: #4B5563; font-size: 15px; line-height: 1.7; margin: 0 0 32px;">
            Cảm ơn bạn đã đăng ký tài khoản tại <strong>FruiTaste</strong>. Để bắt đầu trải nghiệm những loại trái cây tươi ngon nhất, vui lòng nhấn vào nút bên dưới để xác thực địa chỉ email của bạn:
          </p>
          
          <div style="text-align: center; margin: 0 0 32px;">
            <a href="${verificationUrl}" style="display: inline-block; background: #22C55E; color: #ffffff; padding: 16px 40px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);">
              Xác thực ngay
            </a>
          </div>

          <div style="background: #F9FAFB; border-radius: 12px; padding: 16px; margin: 0 0 32px;">
            <p style="margin: 0; color: #6B7280; font-size: 12px; line-height: 1.5; text-align: center;">
              Nếu nút trên không hoạt động, bạn có thể sao chép liên kết này vào trình duyệt: <br/>
              <a href="${verificationUrl}" style="color: #22C55E; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>

          <hr style="border: 0; border-top: 1px solid #F3F4F6; margin: 0 0 24px;" />
          
          <p style="color: #9CA3AF; font-size: 12px; margin: 0; line-height: 1.6;">
            Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ của chúng tôi.
          </p>
        </div>
        <div style="background: #F9FAFB; padding: 24px; text-align: center; border-top: 1px solid #F3F4F6;">
          <p style="margin: 0; color: #9CA3AF; font-size: 11px;">© 2026 FruiTaste Store. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await this.sendMail({
        to: email,
        subject: 'Xác thực tài khoản FruiTaste của bạn',
        html,
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Không thể gửi email xác thực.');
    }
  }
}
