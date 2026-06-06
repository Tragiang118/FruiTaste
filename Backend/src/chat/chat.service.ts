import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SenderType } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // Tạo phiên chat mới
  async createSession(userId?: number) {
    return this.prisma.chatSession.create({
      data: {
        userId: userId || null,
      },
    });
  }

  // Thêm tin nhắn vào phiên chat
  async addMessage(sessionId: number, senderType: SenderType, messageText: string, intent?: string) {
    return this.prisma.chatMessage.create({
      data: {
        sessionId,
        senderType,
        messageText,
        intent,
      },
    });
  }

  // Lưu cả cặp tin nhắn (user + bot) cùng lúc
  async saveConversation(data: {
    sessionId?: number;
    userId?: number;
    userMessage: string;
    botMessage: string;
    intent?: string;
  }) {
    // Nếu chưa có session thì tạo mới
    let sessionId = data.sessionId;
    if (!sessionId) {
      const session = await this.createSession(data.userId);
      sessionId = session.id;
    }

    // Lưu tin nhắn user
    await this.addMessage(sessionId, 'USER', data.userMessage);

    // Lưu tin nhắn bot
    await this.addMessage(sessionId, 'BOT', data.botMessage, data.intent);

    return { sessionId };
  }

  // Kết thúc phiên chat
  async endSession(sessionId: number) {
    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });
  }

  // Lấy lịch sử chat theo session
  async getSessionMessages(sessionId: number) {
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Lấy danh sách phiên chat của user
  async getUserSessions(userId: number) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
      },
    });
  }
}
