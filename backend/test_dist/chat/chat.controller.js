"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const jwt_1 = require("@nestjs/jwt");
const chat_schemas_1 = require("./chat.schemas");
const zod_1 = require("zod");
let ChatController = class ChatController {
    chatService;
    jwtService;
    constructor(chatService, jwtService) {
        this.chatService = chatService;
        this.jwtService = jwtService;
    }
    async chatQuery(body, req, res) {
        const parsed = chat_schemas_1.chatRequestSchema.safeParse(body);
        if (!parsed.success) {
            throw new common_1.BadRequestException({
                message: 'Dữ liệu chatbot không hợp lệ',
                errors: zod_1.z.flattenError(parsed.error).fieldErrors,
            });
        }
        const token = req.cookies?.Authentication;
        let userId = undefined;
        if (token) {
            try {
                const payload = this.jwtService.verify(token, {
                    secret: process.env.JWT_SECRET || 'secretKey',
                });
                userId = payload.sub || payload.id;
            }
            catch (e) {
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
        }
        catch (err) {
            console.error('Chat controller error:', err);
            res.write('Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi này. Bạn thử lại nhé!');
        }
        finally {
            res.end();
        }
    }
    async createSession(body) {
        return this.chatService.createSession(body.userId);
    }
    async saveConversation(body) {
        return this.chatService.saveConversation(body);
    }
    async endSession(id) {
        return this.chatService.endSession(id);
    }
    async getSessionMessages(id) {
        return this.chatService.getSessionMessages(id);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('query'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "chatQuery", null);
__decorate([
    (0, common_1.Post)('session'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)('save'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "saveConversation", null);
__decorate([
    (0, common_1.Post)('session/:id/end'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "endSession", null);
__decorate([
    (0, common_1.Get)('session/:id/messages'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getSessionMessages", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        jwt_1.JwtService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map