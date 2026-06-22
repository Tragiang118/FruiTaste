import { groq } from "@ai-sdk/groq";
import { streamText, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieHeader = req.headers.get("cookie") || "";

    // Lấy text câu hỏi từ nhiều format khác nhau
    let userText = "";
    if (typeof body.text === "string") {
      // Format custom từ ChatbotWidget mới (fetch thủ công)
      userText = body.text;
    } else if (Array.isArray(body.messages)) {
      // Format useChat cũ - lấy tin nhắn user cuối cùng
      const msgs = body.messages;
      const lastUser = [...msgs].reverse().find((m: any) => m.role === "user");
      if (lastUser?.parts) {
        userText = lastUser.parts
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join("");
      } else {
        userText = lastUser?.content || "";
      }
    }

    userText = userText.trim();
    if (!userText) {
      return new Response("Bad Request", { status: 400 });
    }

    console.log("=== Chatbot Request ===");
    console.log("User text:", userText);
    console.log("Cookie:", cookieHeader ? "YES" : "NO");

    const result = (streamText as any)({
      model: groq("llama-3.3-70b-versatile"),
      system: `Bạn là trợ lý ảo FruiTaste - cửa hàng trái cây trực tuyến.
NHIỆM VỤ:
- Trả lời về hoa quả, món ăn từ trái cây, dinh dưỡng.
- Khi khách hỏi giá hoặc hỏi có bán không, BẮT BUỘC gọi tool 'list_products'.
- Luôn kèm theo tag này nếu tool tìm thấy sản phẩm: [PRODUCT:id:tên:giá:đơn vị:tồn kho]
- Khi khách hỏi về đơn hàng (kiểm tra đơn hàng, lịch sử đơn, trạng thái đơn...), BẮT BUỘC gọi tool 'list_orders'.
- Dịch trạng thái đơn hàng sang tiếng Việt:
  + PENDING → Chờ xác nhận
  + CONFIRMED → Đã xác nhận
  + PREPARING → Đang chuẩn bị hàng
  + SHIPPING → Đang giao hàng
  + COMPLETED → Đã hoàn thành
  + CANCELLED → Đã hủy đơn
- Nếu tool 'list_orders' báo lỗi hoặc chưa đăng nhập, hãy nhẹ nhàng thông báo không tìm thấy thông tin và khuyên khách đăng nhập.`,
      messages: [{ role: "user", content: userText }],
      tools: {
        list_products: (tool as any)({
          description: "Tìm sản phẩm trong database theo từ khóa",
          parameters: z.object({
            search: z.string().optional().describe("Từ khóa tìm kiếm sản phẩm"),
          }),
          execute: async ({ search }: { search?: string }) => {
            try {
              console.log("list_products executing, search:", search);
              const url = `${BACKEND_URL}/products?search=${encodeURIComponent(search || "")}`;
              const res = await fetch(url);
              const data = await res.json();
              console.log("list_products found:", data.length, "products");
              return data.slice(0, 3).map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                unit: p.unit || "kg",
                stockQuantity: p.stockQuantity ?? 0,
              }));
            } catch (e) {
              console.error("list_products error:", e);
              return [];
            }
          },
        }),
        list_orders: (tool as any)({
          description: "Lấy danh sách đơn hàng của khách hàng hiện tại",
          parameters: z.object({}),
          execute: async () => {
            try {
              console.log("list_orders executing...");
              const res = await fetch(`${BACKEND_URL}/orders/my-orders`, {
                headers: { cookie: cookieHeader },
              });
              console.log("list_orders backend status:", res.status);
              if (!res.ok) {
                return { error: "Không thể lấy thông tin đơn hàng. Vui lòng đăng nhập để xem đơn hàng." };
              }
              const data = await res.json();
              console.log("list_orders returned:", data?.length || 0, "orders");
              return data;
            } catch (e) {
              console.error("list_orders error:", e);
              return { error: "Lỗi kết nối máy chủ khi lấy danh sách đơn hàng." };
            }
          },
        }),
      },
    });

    // Trả về plain text stream - frontend sẽ đọc và xử lý
    return new Response(result.textStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
