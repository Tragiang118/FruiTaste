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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const groq_1 = require("@ai-sdk/groq");
const ai_1 = require("ai");
const chat_schemas_1 = require("./chat.schemas");
const chat_prompt_1 = require("./chat.prompt");
const chat_tools_1 = require("./chat.tools");
let ChatService = class ChatService {
    prisma;
    configService;
    groqClient;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    getGroq() {
        if (this.groqClient)
            return this.groqClient;
        const apiKey = this.configService.get('GROQ_API_KEY');
        if (!apiKey) {
            throw new common_1.ServiceUnavailableException('Chatbot chưa được cấu hình GROQ_API_KEY trong .env');
        }
        this.groqClient = (0, groq_1.createGroq)({ apiKey });
        return this.groqClient;
    }
    async chatStream(userText, userId) {
        const cleanUserText = userText.trim();
        const intent = (0, chat_tools_1.detectIntent)(cleanUserText);
        let productsList = [];
        try {
            productsList = await this.prisma.product.findMany({
                where: { isDeleted: false, isActive: true },
            });
        }
        catch (e) {
            console.error("Fetch all products error:", e);
        }
        const allProductsConcise = productsList
            .map((p) => `- ${p.name} (ID: ${p.id}): giá ${p.price?.toLocaleString("vi-VN")} VND/${p.unit || "kg"}, còn lại ${p.stockQuantity ?? 0} ${p.unit || "kg"}.`)
            .join("\n");
        const matchedProducts = (0, chat_tools_1.searchProductsLocally)(productsList, cleanUserText);
        let detailedProductsContext = "";
        let productTags = "";
        const topProducts = matchedProducts.slice(0, 4);
        if (topProducts.length > 0) {
            detailedProductsContext = `THÔNG TIN CHI TIẾT SẢN PHẨM KHỚP VỚI CÂU HỎI:\n` +
                topProducts.map((p) => `- ${p.name} (ID: ${p.id}): Mô tả: ${(0, chat_tools_1.cleanHtmlText)(p.description)}. Thông tin dinh dưỡng/sức khỏe: ${(0, chat_tools_1.cleanHtmlText)(p.healthInfo)}`).join("\n");
            productTags = topProducts.map((p) => `[PRODUCT:${p.id}:${p.name}:${p.price}:${p.unit || "kg"}:${p.stockQuantity ?? 0}]`).join("\n");
        }
        let ordersContext = "";
        if (intent === "order" && userId) {
            try {
                const orders = await this.prisma.order.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                });
                if (orders.length > 0) {
                    const statusMap = {
                        PENDING: "Chờ xác nhận",
                        CONFIRMED: "Đã xác nhận",
                        PREPARING: "Đang chuẩn bị hàng",
                        SHIPPING: "Đang giao hàng",
                        COMPLETED: "Đã hoàn thành",
                        CANCELLED: "Đã hủy đơn",
                    };
                    ordersContext = `DỮ LIỆU ĐƠN HÀNG CỦA KHÁCH:\n` +
                        orders.map((o) => `- Đơn #${o.id}: ${statusMap[o.status] || o.status}, thành tiền (đã gồm ship) ${o.finalAmount?.toLocaleString("vi-VN")} VND (tiền hàng: ${o.totalAmount?.toLocaleString("vi-VN")} VND, phí ship: ${o.shippingFee?.toLocaleString("vi-VN")} VND), ngày đặt hàng: ${new Date(o.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`).join("\n");
                }
                else {
                    ordersContext = "DỮ LIỆU ĐƠN HÀNG: Khách hàng chưa có đơn hàng nào.";
                }
            }
            catch (e) {
                console.error("Fetch orders error:", e);
                ordersContext = "DỮ LIỆU ĐƠN HÀNG: Lỗi kết nối máy chủ.";
            }
        }
        else if (intent === "order" && !userId) {
            ordersContext = "DỮ LIỆU ĐƠN HÀNG: Không thể truy xuất (chưa đăng nhập).";
        }
        const systemPrompt = (0, chat_prompt_1.buildChatbotSystemPrompt)({
            allProductsConcise,
            detailedProductsContext,
            ordersContext,
            productTags,
        });
        const result = (0, ai_1.streamText)({
            model: this.getGroq()(chat_schemas_1.CHATBOT_MODEL),
            system: systemPrompt,
            messages: [{ role: "user", content: cleanUserText }],
        });
        return result;
    }
    async createSession(userId) {
        return this.prisma.chatSession.create({
            data: {
                userId: userId || null,
            },
        });
    }
    async addMessage(sessionId, senderType, messageText, intent) {
        return this.prisma.chatMessage.create({
            data: {
                sessionId,
                senderType,
                messageText,
                intent,
            },
        });
    }
    async saveConversation(data) {
        let sessionId = data.sessionId;
        if (!sessionId) {
            const session = await this.createSession(data.userId);
            sessionId = session.id;
        }
        await this.addMessage(sessionId, 'USER', data.userMessage);
        await this.addMessage(sessionId, 'BOT', data.botMessage, data.intent);
        return { sessionId };
    }
    async endSession(sessionId) {
        return this.prisma.chatSession.update({
            where: { id: sessionId },
            data: { endedAt: new Date() },
        });
    }
    async getSessionMessages(sessionId) {
        return this.prisma.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getUserSessions(userId) {
        return this.prisma.chatSession.findMany({
            where: { userId },
            orderBy: { startedAt: 'desc' },
            include: {
                _count: { select: { messages: true } },
            },
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], ChatService);
//# sourceMappingURL=chat.service.js.map