const { groq } = require("@ai-sdk/groq");
const { streamText, tool, convertToModelMessages } = require("ai");
const z = require("zod");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const messages = [{"role":"user","content":"Táo làm được món gì?"}];
  const recentMessages = messages.slice(-5);
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  try {
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: `Bạn là trợ lý ảo FruiTaste. 
NHIỆM VỤ:
- Trả lời về hoa quả, món ăn.
- Khi khách hỏi giá hoặc hỏi có bán không, BẮT BUỘC gọi tool 'list_products'.
- Luôn kèm theo tag này nếu tool tìm thấy sản phẩm: [PRODUCT:id:tên:giá:đơn vị:tồn kho]`,
      messages: recentMessages.map((m) => ({
        role: m.role,
        content: m.content || (m.parts && m.parts.filter(p => p.type === 'text').map(p => p.text).join('')) || ""
      })),
      tools: {
        list_products: tool({
          description: "Tìm sản phẩm trong database",
          parameters: z.object({
            search: z.string().optional()
          }),
          execute: async ({ search }) => {
            try {
              const res = await fetch(`${BACKEND_URL}/products`);
              const dataRaw = await res.json();
              let data = dataRaw.filter((p) => p.isActive && !p.isDeleted);
              if (search) {
                const kw = search.toLowerCase();
                data = data.filter((p) => p.name.toLowerCase().includes(kw));
              }
              return data.slice(0, 3).map((p) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                unit: p.unit || "kg",
                stockQuantity: p.stockQuantity ?? 0
              }));
            } catch (e) { return []; }
          }
        })
      },
      maxSteps: 2,
    });

    console.log("Starting stream...");
    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log("\nDone!");
  } catch (error) {
    console.error("ROUTE RUN ERROR:", error);
  }
}

main();
