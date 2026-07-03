import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
export declare class ChatController {
    private chatService;
    private jwtService;
    constructor(chatService: ChatService, jwtService: JwtService);
    chatQuery(body: any, req: Request, res: Response): Promise<void>;
    createSession(body: {
        userId?: number;
    }): Promise<{
        id: number;
        userId: number | null;
        startedAt: Date;
        endedAt: Date | null;
    }>;
    saveConversation(body: {
        sessionId?: number;
        userId?: number;
        userMessage: string;
        botMessage: string;
        intent?: string;
    }): Promise<{
        sessionId: number;
    }>;
    endSession(id: number): Promise<{
        id: number;
        userId: number | null;
        startedAt: Date;
        endedAt: Date | null;
    }>;
    getSessionMessages(id: number): Promise<{
        createdAt: Date;
        id: number;
        senderType: import(".prisma/client").$Enums.SenderType;
        messageText: string;
        intent: string | null;
        sessionId: number;
    }[]>;
}
