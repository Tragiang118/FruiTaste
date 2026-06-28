import { Controller, Post, Body, Get, Param, ParseIntPipe, Req, Res, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { chatRequestSchema } from './chat.schemas';
import { z } from 'zod';

@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  // POST /api/chat/query - Trò chuyện với trợ lý ảo và nhận stream kết quả
  @Post('query')
  async chatQuery(
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Dữ liệu chatbot không hợp lệ',
        errors: z.flattenError(parsed.error).fieldErrors,
      });
    }

    const token = req.cookies?.Authentication;
    let userId: number | undefined = undefined;
    if (token) {
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'secretKey',
        });
        userId = payload.sub || payload.id;
      } catch (e) {
        // Bỏ qua nếu token không hợp lệ (coi như khách vãng lai)
      }
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      const streamResult = await this.chatService.chatStream(parsed.data.text, userId);
      for await (const chunk of streamResult.textStream) {
        res.write(chunk);
      }
    } catch (err) {
      console.error('Chat controller error:', err);
      res.write('Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi này. Bạn thử lại nhé!');
    } finally {
      res.end();
    }
  }

  // POST /api/chat/session - Tạo phiên chat mới
  @Post('session')
  async createSession(@Body() body: { userId?: number }) {
    return this.chatService.createSession(body.userId);
  }

  // POST /api/chat/save - Lưu cặp tin nhắn user + bot
  @Post('save')
  async saveConversation(
    @Body() body: {
      sessionId?: number;
      userId?: number;
      userMessage: string;
      botMessage: string;
      intent?: string;
    },
  ) {
    return this.chatService.saveConversation(body);
  }

  // POST /api/chat/session/:id/end - Kết thúc phiên chat
  @Post('session/:id/end')
  async endSession(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.endSession(id);
  }

  // GET /api/chat/session/:id/messages - Lấy tin nhắn theo phiên
  @Get('session/:id/messages')
  async getSessionMessages(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.getSessionMessages(id);
  }
}
