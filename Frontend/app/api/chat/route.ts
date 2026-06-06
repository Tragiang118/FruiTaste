import { groq } from "@ai-sdk/groq";
import { streamText, tool, convertToModelMessages } from "ai"; 
import { z } from "zod";

export const maxDuration = 30;
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const recentMessages = messages.slice(-5);

    const result = (streamText as any)({
      model: groq("llama-3.3-70b-versatile"),
      system: `Bạn là trợ lý ảo FruiTaste. 
NHIỆM VỤ:
- Trả lời về hoa quả, món ăn.
- Khi khách hỏi giá hoặc hỏi có bán không, BẮT BUỘC gọi tool 'list_products'.
- Luôn kèm theo tag này nếu tool tìm thấy sản phẩm: [PRODUCT:id:tên:giá:đơn vị:tồn kho]`,
      messages: recentMessages.map((m: any) => ({
        role: m.role,
        content: m.content || (m.parts && m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')) || ""
      })),
      tools: {
        list_products: (tool as any)({
          description: "Tìm sản phẩm trong database",
          parameters: z.object({
            search: z.string().optional()
          }),
          execute: async ({ search }: { search?: string }) => {
            try {
              const res = await fetch(`${BACKEND_URL}/products`);
              const dataRaw = await res.json();
              let data = dataRaw.filter((p: any) => p.isActive && !p.isDeleted);
              if (search) {
                const kw = search.toLowerCase();
                data = data.filter((p: any) => p.name.toLowerCase().includes(kw));
              }
              return data.slice(0, 3).map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                unit: p.unit || "kg",
                stockQuantity: p.stockQuantity ?? 0
              }));
            } catch (e) { return []; }
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
