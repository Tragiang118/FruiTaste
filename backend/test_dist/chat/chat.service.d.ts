import { PrismaService } from '../prisma/prisma.service';
import { SenderType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
export declare class ChatService {
    private prisma;
    private configService;
    private groqClient?;
    constructor(prisma: PrismaService, configService: ConfigService);
    private getGroq;
    chatStream(userText: string, userId?: number): Promise<any>;
    createSession(userId?: number): Promise<{
        id: number;
        userId: number | null;
        startedAt: Date;
        endedAt: Date | null;
    }>;
    addMessage(sessionId: number, senderType: SenderType, messageText: string, intent?: string): Promise<{
        createdAt: Date;
        id: number;
        senderType: import(".prisma/client").$Enums.SenderType;
        messageText: string;
        intent: string | null;
        sessionId: number;
    }>;
    saveConversation(data: {
        sessionId?: number;
        userId?: number;
        userMessage: string;
        botMessage: string;
        intent?: string;
    }): Promise<{
        sessionId: number;
    }>;
    endSession(sessionId: number): Promise<{
        id: number;
        userId: number | null;
        startedAt: Date;
        endedAt: Date | null;
    }>;
    getSessionMessages(sessionId: number): Promise<{
        createdAt: Date;
        id: number;
        senderType: import(".prisma/client").$Enums.SenderType;
        messageText: string;
        intent: string | null;
        sessionId: number;
    }[]>;
    getUserSessions(userId: number): Promise<({
        _count: {
            messages: number;
        };
    } & {
        id: number;
        userId: number | null;
        startedAt: Date;
        endedAt: Date | null;
    })[]>;
}
