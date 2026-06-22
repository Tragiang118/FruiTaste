import { groq } from "@ai-sdk/groq";
import { streamText, tool, convertToModelMessages } from "ai"; 
import { z } from "zod";

export const maxDuration = 30;
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const recentMessages = messages.slice(-5);
    const cookieHeader = req.headers.get("cookie") || "";
    
    console.log("=== Chatbot Request ===");
    console.log("Recent messages:", JSON.stringify(recentMessages));
    console.log("Cookie header found:", cookieHeader ? "YES" : "NO");
    if (cookieHeader) {
      console.log("Cookie details:", cookieHeader);
    }

    const result = (streamText as any)({
      model: groq("llama-3.3-70b-versatile"),
      system: `Bạn là trợ lý ảo FruiTaste.
NHIỆM VỤ:
- Trả lời về hoa quả, món ăn.
- Khi khách hỏi giá hoặc hỏi có bán không, BẮT BUỘC gọi tool 'list_products'.
- Luôn kèm theo tag này nếu tool tìm thấy sản phẩm: [PRODUCT:id:tên:giá:đơn vị:tồn kho]
- Khi khách hỏi về đơn hàng của họ (ví dụ: kiểm tra đơn hàng, xem lịch sử đơn hàng, tôi có đơn nào không, đơn nào đang xử lý, trạng thái đơn hàng thế nào...), BẮT BUỘC gọi tool 'list_orders'.
- Trạng thái đơn hàng nhận được từ tool 'list_orders' cần dịch sang tiếng Việt để trả lời cho khách:
  + PENDING: Chờ xác nhận
  + CONFIRMED: Đã xác nhận
  + PREPARING: Đang chuẩn bị hàng
  + SHIPPING: Đang giao hàng
  + COMPLETED: Đã hoàn thành
  + CANCELLED: Đã hủy đơn
- Nếu kết quả từ tool 'list_orders' báo lỗi hoặc chưa đăng nhập, hãy lịch sự phản hồi là không tìm thấy thông tin đơn hàng và khuyên khách hàng hãy đăng nhập tài khoản của mình trên hệ thống để xem đơn hàng.`,
      messages: convertToModelMessages(recentMessages),
      tools: {
        list_products: (tool as any)({
          description: "Tìm sản phẩm trong database",
          parameters: z.object({
            search: z.string().optional()
          }),
          execute: async ({ search }: { search?: string }) => {
            try {
              console.log("list_products tool executing, search term:", search);
              const url = `${BACKEND_URL}/products?search=${encodeURIComponent(search || "")}`;
              const res = await fetch(url);
              const data = await res.json();
              console.log("list_products tool found:", data.length, "products");
              return data.slice(0, 3).map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                unit: p.unit || "kg",
                stockQuantity: p.stockQuantity ?? 0
              }));
            } catch (e) { 
              console.error("list_products error:", e);
              return []; 
            }
          }
        }) as any,
        list_orders: (tool as any)({
          description: "Lấy danh sách các đơn hàng của khách hàng hiện tại.",
          parameters: z.object({}),
          execute: async () => {
            try {
              console.log("list_orders tool executing...");
              const url = `${BACKEND_URL}/orders/my-orders`;
              console.log("Fetching from backend:", url);
              const res = await fetch(url, {
                headers: {
                  cookie: cookieHeader,
                },
              });
              console.log("Backend response status:", res.status);
              if (!res.ok) {
                console.warn("Backend returned non-OK status code:", res.status);
                return { error: "Không thể lấy thông tin đơn hàng do người dùng chưa đăng nhập hoặc lỗi hệ thống." };
              }
              const data = await res.json();
              console.log("Backend returned", data?.length || 0, "orders");
              return data;
            } catch (e) {
              console.error("list_orders fetch error:", e);
              return { error: "Lỗi kết nối đến máy chủ khi lấy danh sách đơn hàng." };
            }
          }
        }) as any
      },
      maxSteps: 2,
    });

    // Cơ chế tự thích ứng với mọi phiên bản SDK
    if (typeof (result as any).toUIMessageStreamResponse === 'function') {
      return (result as any).toUIMessageStreamResponse();
    }

    if (typeof (result as any).toDataStreamResponse === 'function') {
      return (result as any).toDataStreamResponse();
    }
    
    if (typeof (result as any).toAIStreamResponse === 'function') {
      return (result as any).toAIStreamResponse();
    }

    if (typeof (result as any).toTextStreamResponse === 'function') {
      return (result as any).toTextStreamResponse();
    }

    // Fallback cuối cùng: Trả về luồng văn bản thuần túy (Text Stream)
    // Frontend vẫn sẽ hiển thị thẻ sản phẩm nhờ cơ chế quét tag [PRODUCT:...]
    return new Response(result.textStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
