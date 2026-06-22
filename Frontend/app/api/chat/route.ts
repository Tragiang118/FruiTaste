import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";

export const maxDuration = 30;
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Phát hiện loại câu hỏi
function detectIntent(text: string): "order" | "product" | "general" {
  const lower = text.toLowerCase();
  const orderKeywords = ["đơn hàng", "đơn của tôi", "tôi có đơn", "kiểm tra đơn", "lịch sử đơn", "trạng thái đơn", "order", "đặt hàng của tôi", "tôi đặt", "đơn nào", "theo dõi đơn"];
  const productKeywords = ["giá", "bao nhiêu", "bán không", "có bán", "mua", "sản phẩm", "hàng", "tồn kho", "còn không", "kg", "tiền"];

  if (orderKeywords.some((k) => lower.includes(k))) return "order";
  if (productKeywords.some((k) => lower.includes(k))) return "product";
  return "general";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieHeader = req.headers.get("cookie") || "";

    // Lấy text câu hỏi
    let userText = "";
    if (typeof body.text === "string") {
      userText = body.text;
    } else if (Array.isArray(body.messages)) {
      const lastUser = [...body.messages].reverse().find((m: any) => m.role === "user");
      userText = lastUser?.content || lastUser?.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") || "";
    }

    userText = userText.trim();
    if (!userText) return new Response("Bad Request", { status: 400 });

    console.log("=== Chatbot Request ===", userText);

    const intent = detectIntent(userText);
    console.log("Intent:", intent);

    // Fetch dữ liệu trước khi gọi AI
    let contextData = "";
    let productTags = "";

    if (intent === "product") {
      try {
        // Trích từ khóa từ câu hỏi (lấy từ có nghĩa)
        const searchTerm = userText.replace(/giá|bao nhiêu|bán không|có bán|mua|tồn kho|còn không|tiền/gi, "").trim();
        const url = `${BACKEND_URL}/products?search=${encodeURIComponent(searchTerm)}`;
        const res = await fetch(url);
        const products = await res.json();
        const topProducts = (Array.isArray(products) ? products : []).slice(0, 3);

        if (topProducts.length > 0) {
          contextData = `\n\nDỮ LIỆU SẢN PHẨM TỪ HỆ THỐNG:\n` +
            topProducts.map((p: any) =>
              `- ${p.name}: ${p.price?.toLocaleString("vi-VN")} VND/${p.unit || "kg"}, còn ${p.stockQuantity ?? 0} ${p.unit || "kg"}`
            ).join("\n");

          productTags = topProducts.map((p: any) =>
            `[PRODUCT:${p.id}:${p.name}:${p.price}:${p.unit || "kg"}:${p.stockQuantity ?? 0}]`
          ).join(" ");
        }
      } catch (e) {
        console.error("Fetch products error:", e);
      }
    }

    if (intent === "order") {
      try {
        const res = await fetch(`${BACKEND_URL}/orders/my-orders`, {
          headers: { cookie: cookieHeader },
        });
        console.log("Orders fetch status:", res.status);

        if (res.ok) {
          const orders = await res.json();
          if (Array.isArray(orders) && orders.length > 0) {
            const statusMap: Record<string, string> = {
              PENDING: "Chờ xác nhận",
              CONFIRMED: "Đã xác nhận",
              PREPARING: "Đang chuẩn bị hàng",
              SHIPPING: "Đang giao hàng",
              COMPLETED: "Đã hoàn thành",
              CANCELLED: "Đã hủy đơn",
            };
            contextData = `\n\nDỮ LIỆU ĐƠN HÀNG CỦA KHÁCH:\n` +
              orders.slice(0, 5).map((o: any) =>
                `- Đơn #${o.id}: ${statusMap[o.status] || o.status}, tổng tiền ${o.totalAmount?.toLocaleString("vi-VN")} VND, ngày đặt ${new Date(o.createdAt).toLocaleDateString("vi-VN")}`
              ).join("\n");
          } else {
            contextData = "\n\nDỮ LIỆU ĐƠN HÀNG: Khách hàng chưa có đơn hàng nào.";
          }
        } else {
          contextData = "\n\nDỮ LIỆU ĐƠN HÀNG: Không thể truy xuất (chưa đăng nhập hoặc lỗi hệ thống).";
        }
      } catch (e) {
        console.error("Fetch orders error:", e);
        contextData = "\n\nDỮ LIỆU ĐƠN HÀNG: Lỗi kết nối máy chủ.";
      }
    }

    const systemPrompt = `Bạn là trợ lý ảo FruiTaste - cửa hàng trái cây trực tuyến.
Nhiệm vụ: Trả lời thân thiện về hoa quả, dinh dưỡng, món ăn từ trái cây, đơn hàng của khách.
${contextData ? `Sử dụng dữ liệu sau để trả lời chính xác:${contextData}` : ""}
${productTags ? `\nSau phần trả lời, thêm dòng này để hiển thị thẻ sản phẩm: ${productTags}` : ""}
Trả lời bằng tiếng Việt, ngắn gọn, thân thiện.`;

    const result = (streamText as any)({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: [{ role: "user", content: userText }],
    });

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
