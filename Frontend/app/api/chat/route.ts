import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";

export const maxDuration = 30;
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Hàm làm sạch HTML text để truyền làm ngữ cảnh cho AI
function cleanHtmlText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ") // Xóa các thẻ HTML
    .replace(/&nbsp;/gi, " ") // Xóa khoảng trắng không ngắt
    .replace(/\s+/g, " ")     // Thu gọn khoảng trắng thừa
    .trim();
}

// Tìm kiếm sản phẩm tại local bằng cách tính điểm khớp từ khóa
function searchProductsLocally(products: any[], queryText: string): any[] {
  const cleanQuery = queryText.toLowerCase();
  
  // Các từ dừng không có giá trị phân biệt sản phẩm
  const stopWords = ["giá", "bao", "nhiêu", "tiền", "bán", "không", "mua", "còn", "hàng", "có", "nhiu", "ko", "quả", "trái", "kg", "hộp", "thế", "nào", "sao", "ở", "fruitaste", "đơn", "hỏi", "với", "cho", "xin", "chào"];
  
  const words = cleanQuery
    .split(/[\s,.\-\/]+/)
    .map(w => w.trim())
    .filter(w => w.length > 1 && !stopWords.includes(w));

  if (words.length === 0) {
    // Dự phòng tìm kiếm chuỗi thô nếu không tách được từ khóa nào
    const rawSearch = cleanQuery.replace(/giá|bao nhiêu|bao tiền|nhiêu|nhiu|bán không|bán ko|có bán|mua|tồn kho|còn không|tiền/gi, "").trim();
    if (!rawSearch) return [];
    return products.filter((p: any) => p.name.toLowerCase().includes(rawSearch));
  }

  // Chấm điểm mức độ khớp của tên sản phẩm với danh sách từ khóa
  const scored = products
    .map((p: any) => {
      const nameLower = p.name.toLowerCase();
      let score = 0;
      for (const word of words) {
        if (nameLower.includes(word)) {
          score += 1;
          // Điểm cộng nếu khớp chính xác biên từ (tránh việc "đào" khớp nhầm "dâu")
          if (new RegExp(`\\b${word}\\b`, "i").test(nameLower)) {
            score += 1;
          }
        }
      }
      return { product: p, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map(item => item.product);
}

// Phát hiện loại ý định câu hỏi
function detectIntent(text: string): "order" | "product" | "general" {
  const lower = text.toLowerCase();
  const orderKeywords = ["đơn hàng", "đơn của tôi", "tôi có đơn", "kiểm tra đơn", "lịch sử đơn", "trạng thái đơn", "order", "đặt hàng của tôi", "tôi đặt", "đơn nào", "theo dõi đơn"];
  const productKeywords = ["giá", "bao nhiêu", "bán không", "có bán", "mua", "sản phẩm", "hàng", "tồn kho", "còn không", "kg", "tiền", "nhiêu", "nhiu"];

  if (orderKeywords.some((k) => lower.includes(k))) return "order";
  if (productKeywords.some((k) => lower.includes(k))) return "product";
  return "general";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieHeader = req.headers.get("cookie") || "";

    // Lấy text câu hỏi của user
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
    let orderFormTag = "";

    // 1. Tải danh sách tất cả sản phẩm
    let productsList: any[] = [];
    try {
      const res = await fetch(`${BACKEND_URL}/products`);
      if (res.ok) {
        productsList = await res.json();
      }
    } catch (e) {
      console.error("Fetch all products error:", e);
    }

    // 2. Xử lý logic tìm sản phẩm (cho cả intent product và general nếu có từ khóa khớp mạnh)
    const matchedProducts = searchProductsLocally(productsList, userText);
    
    // Nhận diện ý định đặt hàng (mua, đặt, order...)
    const buyKeywords = ["đặt", "mua", "order", "lấy", "bán cho", "chốt", "thanh toán", "cọc", "muốn mua", "muốn đặt"];
    const isBuyIntent = buyKeywords.some(k => userText.toLowerCase().includes(k)) && matchedProducts.length > 0;

    // Nếu có intent hỏi sản phẩm, hoặc người dùng hỏi chung nhưng khớp mạnh tên sản phẩm cụ thể, hoặc muốn mua luôn
    if (intent === "product" || (intent === "general" && matchedProducts.length > 0) || isBuyIntent) {
      const topProducts = matchedProducts.slice(0, 3);
      if (topProducts.length > 0) {
        contextData = `\n\nDỮ LIỆU SẢN PHẨM TỪ HỆ THỐNG:\n` +
          topProducts.map((p: any) =>
            `- ${p.name}: giá ${p.price?.toLocaleString("vi-VN")} VND/${p.unit || "kg"}, còn lại ${p.stockQuantity ?? 0} ${p.unit || "kg"}. Mô tả: ${cleanHtmlText(p.description)}. Thông tin dinh dưỡng/sức khỏe: ${cleanHtmlText(p.healthInfo)}`
          ).join("\n");

        productTags = topProducts.map((p: any) =>
          `[PRODUCT:${p.id}:${p.name}:${p.price}:${p.unit || "kg"}:${p.stockQuantity ?? 0}]`
        ).join(" ");

        if (isBuyIntent) {
          // Trích xuất số lượng mua (tìm số đầu tiên xuất hiện trong câu)
          const quantityMatch = userText.match(/\b\d+\b/);
          let quantity = 1;
          if (quantityMatch) {
            const q = parseInt(quantityMatch[0], 10);
            if (q > 0) quantity = q;
          }
          orderFormTag = `[ORDER_FORM:${topProducts[0].id}:${quantity}]`;
        }
      }
    }

    // 3. Xử lý logic đơn hàng
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
                `- Đơn #${o.id}: ${statusMap[o.status] || o.status}, thành tiền (đã gồm ship) ${o.finalAmount?.toLocaleString("vi-VN")} VND (tiền hàng: ${o.totalAmount?.toLocaleString("vi-VN")} VND, phí ship: ${o.shippingFee?.toLocaleString("vi-VN")} VND), ngày đặt hàng: ${new Date(o.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`
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
${contextData ? `Sử dụng dữ liệu sau để trả lời chính xác, TUYỆT ĐỐI không tự bịa đặt giá cả hoặc thông tin đơn hàng khác với dữ liệu dưới đây:\n${contextData}` : "Trả lời các thông tin chung về hoa quả, tư vấn dinh dưỡng hoặc hướng dẫn nấu ăn một cách hữu ích."}
${productTags ? `\nSau phần trả lời, thêm dòng này để hiển thị thẻ sản phẩm: ${productTags}` : ""}
${orderFormTag ? `\nSau phần trả lời (và sau cả thẻ sản phẩm nếu có), BẮT BUỘC thêm thẻ đặt hàng này vào cuối câu trả lời để khách hàng điền thông tin: ${orderFormTag}\nHãy hướng dẫn khách hàng điền các thông tin trong form bên dưới để hoàn tất đặt hàng.` : ""}
Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, xưng hô tôn trọng khách hàng.`;

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
