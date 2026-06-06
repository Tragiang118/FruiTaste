import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

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
