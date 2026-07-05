// Hàm làm sạch HTML text để truyền làm ngữ cảnh cho AI
export function cleanHtmlText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ") // Xóa các thẻ HTML
    .replace(/&nbsp;/gi, " ") // Xóa khoảng trắng không ngắt
    .replace(/\s+/g, " ")     // Thu gọn khoảng trắng thừa
    .trim();
}

export interface ProductItem {
  id: number;
  name: string;
  price: number;
  unit?: string | null;
  stockQuantity?: number | null;
  healthInfo?: string | null;
  tags?: string[] | null;
  isActive?: boolean;
}

// Tìm kiếm sản phẩm tại local bằng cách tính điểm khớp từ khóa
export function searchProductsLocally(products: ProductItem[], queryText: string): ProductItem[] {
  const cleanQuery = queryText.toLowerCase();
  
  // Các từ dừng không có giá trị phân biệt sản phẩm, bổ sung thêm các liên từ và từ hành động
  const stopWords = [
    "giá", "bao", "nhiêu", "tiền", "bán", "không", "mua", "còn", "hàng", "có", "nhiu", "ko", "quả", "trái", 
    "kg", "hộp", "thế", "nào", "sao", "ở", "fruitaste", "đơn", "hỏi", "với", "cho", "xin", "chào",
    "và", "đặt", "muốn", "thêm", "cả", "nhé", "nha", "tôi", "em", "khách", "mình", "lấy", "order"
  ];
  
  const words = cleanQuery
    .split(/[\s,.\-\/]+/)
    .map(w => w.trim())
    .filter(w => w.length > 1 && !stopWords.includes(w));
  
  if (words.length === 0) {
    // Dự phòng tìm kiếm chuỗi thô nếu không tách được từ khóa nào
    const rawSearch = cleanQuery.replace(/giá|bao nhiêu|bao tiền|nhiêu|nhiu|bán không|bán ko|có bán|mua|tồn kho|còn không|tiền/gi, "").trim();
    if (!rawSearch) return [];
    return products.filter((p) => p.name.toLowerCase().includes(rawSearch));
  }

  // Chấm điểm mức độ khớp của sản phẩm với danh sách từ khóa
  const scored = products
    .map((p) => {
      const nameLower = p.name.toLowerCase();
      const nameWords = nameLower.split(/[\s,.\-\/]+/);
      
      const healthLower = (p.healthInfo || "").toLowerCase();
      const healthWords = healthLower.split(/[\s,.\-\/]+/);
      
      const tagsLower = (p.tags || []).map((t: string) => t.toLowerCase());

      let score = 0;
      for (const word of words) {
        // 1. So khớp với Tên sản phẩm (Trọng số cao nhất)
        if (nameWords.includes(word)) {
          score += 5; // Khớp từ nguyên vẹn trong tên
        } else if (word.length > 2 && nameLower.includes(word)) {
          score += 2; // Khớp một phần trong tên (chỉ áp dụng cho từ dài hơn 2 ký tự)
        }

        // 2. So khớp với tags (Trọng số trung bình)
        if (tagsLower.includes(word)) {
          score += 3;
        }

        // 3. So khớp với thông tin sức khỏe/dinh dưỡng (Trọng số trung bình)
        if (healthWords.includes(word)) {
          score += 2;
        } else if (word.length > 2 && healthLower.includes(word)) {
          score += 1;
        }
      }
      return { product: p, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map(item => item.product);
}

// Phát hiện loại ý định câu hỏi
export function detectIntent(text: string): "order" | "product" | "general" {
  const lower = text.toLowerCase();
  const orderKeywords = ["đơn hàng", "đơn của tôi", "tôi có đơn", "kiểm tra đơn", "lịch sử đơn", "trạng thái đơn", "order", "đặt hàng của tôi", "tôi đặt", "đơn nào", "theo dõi đơn"];
  const productKeywords = ["giá", "bao nhiêu", "bán không", "có bán", "mua", "sản phẩm", "hàng", "tồn kho", "còn không", "kg", "tiền", "nhiêu", "nhiu"];

  if (orderKeywords.some((k) => lower.includes(k))) return "order";
  if (productKeywords.some((k) => lower.includes(k))) return "product";
  return "general";
}
