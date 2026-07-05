import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SenderType, Product, Order } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { CHATBOT_MODEL } from './chat.schemas';
import { buildChatbotSystemPrompt } from './chat.prompt';
import { cleanHtmlText, searchProductsLocally, detectIntent, ProductItem } from './chat.tools';

@Injectable()
export class ChatService {
  private groqClient?: ReturnType<typeof createGroq>;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private getGroq() {
    if (this.groqClient) return this.groqClient;

    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('Chatbot chưa được cấu hình GROQ_API_KEY trong .env');
    }

    this.groqClient = createGroq({ apiKey });
    return this.groqClient;
  }

  async chatStream(userText: string, userId?: number): Promise<any> {
    const cleanUserText = userText.trim();
    const intent = detectIntent(cleanUserText);

    // Fetch dữ liệu trước khi gọi AI
    let productsList: Product[] = [];
    try {
      productsList = await this.prisma.product.findMany({
        where: { isDeleted: false, isActive: true },
      });
    } catch (e) {
      console.error("Fetch all products error:", e);
    }

    // Tạo danh sách tất cả sản phẩm ở dạng rút gọn để AI luôn biết cửa hàng đang bán gì
    const allProductsConcise = productsList
      .map((p) => `- ${p.name} (ID: ${p.id}): giá ${p.price?.toLocaleString("vi-VN")} VND/${p.unit || "kg"}, còn lại ${p.stockQuantity ?? 0} ${p.unit || "kg"}.`)
      .join("\n");

    // Xử lý logic tìm sản phẩm khớp
    const matchedProducts = searchProductsLocally(productsList as ProductItem[], cleanUserText);

    let detailedProductsContext = "";
    let productTags = "";

    const topProducts = matchedProducts.slice(0, 5); // Lấy tối đa 5 sản phẩm khớp nhất
    if (topProducts.length > 0) {
      detailedProductsContext = `THÔNG TIN CHI TIẾT SẢN PHẨM KHỚP VỚI CÂU HỎI:\n` +
        topProducts.map((p) =>
          `- ${p.name} (ID: ${p.id}): Mô tả: ${cleanHtmlText((p as any).description || '')}. Thông tin dinh dưỡng/sức khỏe: ${cleanHtmlText(p.healthInfo || '')}`
        ).join("\n");

      productTags = topProducts.map((p) =>
        `[PRODUCT:${p.id}:${p.name}:${p.price}:${p.unit || "kg"}:${p.stockQuantity ?? 0}]`
      ).join("\n");
    }

    // Xử lý logic đơn hàng
    let ordersContext = "";
    let orderTags = "";
    if (intent === "order" && userId) {
      try {
        const orders: Order[] = await this.prisma.order.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

        if (orders.length > 0) {
          const statusMap: Record<string, string> = {
            PENDING: "Chờ xác nhận",
            CONFIRMED: "Đã xác nhận",
            PREPARING: "Đang chuẩn bị hàng",
            SHIPPING: "Đang giao hàng",
            COMPLETED: "Đã hoàn thành",
            CANCELLED: "Đã hủy đơn",
          };
          ordersContext = `DỮ LIỆU ĐƠN HÀNG CỦA KHÁCH:\n` +
            orders.map((o) =>
              `- Đơn #${o.id}: ${statusMap[o.status] || o.status}, thành tiền (đã gồm ship) ${o.finalAmount?.toLocaleString("vi-VN")} VND (tiền hàng: ${o.totalAmount?.toLocaleString("vi-VN")} VND, phí ship: ${o.shippingFee?.toLocaleString("vi-VN")} VND), ngày đặt hàng: ${new Date(o.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`
            ).join("\n");

          orderTags = orders.map((o) =>
            `[ORDER_CARD:${o.id}:${o.status}:${o.finalAmount}:${o.createdAt}]`
          ).join("\n");
        } else {
          ordersContext = "DỮ LIỆU ĐƠN HÀNG: Khách hàng chưa có đơn hàng nào.";
        }
      } catch (e) {
        console.error("Fetch orders error:", e);
        ordersContext = "DỮ LIỆU ĐƠN HÀNG: Lỗi kết nối máy chủ.";
      }
    } else if (intent === "order" && !userId) {
      ordersContext = "DỮ LIỆU ĐƠN HÀNG: Không thể truy xuất (chưa đăng nhập).";
    }

    const systemPrompt = buildChatbotSystemPrompt({
      allProductsConcise,
      detailedProductsContext,
      ordersContext,
      productTags,
      orderTags,
    });

    const result = streamText({
      model: this.getGroq()(CHATBOT_MODEL),
      system: systemPrompt,
      messages: [{ role: "user", content: cleanUserText }],
    });

    return result;
  }

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
