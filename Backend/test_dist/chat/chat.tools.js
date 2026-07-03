"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanHtmlText = cleanHtmlText;
exports.searchProductsLocally = searchProductsLocally;
exports.detectIntent = detectIntent;
function cleanHtmlText(html) {
    if (!html)
        return "";
    return html
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function searchProductsLocally(products, queryText) {
    const cleanQuery = queryText.toLowerCase();
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
        const rawSearch = cleanQuery.replace(/giá|bao nhiêu|bao tiền|nhiêu|nhiu|bán không|bán ko|có bán|mua|tồn kho|còn không|tiền/gi, "").trim();
        if (!rawSearch)
            return [];
        return products.filter((p) => p.name.toLowerCase().includes(rawSearch));
    }
    const scored = products
        .map((p) => {
        const nameLower = p.name.toLowerCase();
        const nameWords = nameLower.split(/[\s,.\-\/]+/);
        const healthLower = (p.healthInfo || "").toLowerCase();
        const healthWords = healthLower.split(/[\s,.\-\/]+/);
        const tagsLower = (p.tags || []).map((t) => t.toLowerCase());
        let score = 0;
        for (const word of words) {
            if (nameWords.includes(word)) {
                score += 5;
            }
            else if (word.length > 2 && nameLower.includes(word)) {
                score += 2;
            }
            if (tagsLower.includes(word)) {
                score += 3;
            }
            if (healthWords.includes(word)) {
                score += 2;
            }
            else if (word.length > 2 && healthLower.includes(word)) {
                score += 1;
            }
        }
        return { product: p, score };
    })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);
    return scored.map(item => item.product);
}
function detectIntent(text) {
    const lower = text.toLowerCase();
    const orderKeywords = ["đơn hàng", "đơn của tôi", "tôi có đơn", "kiểm tra đơn", "lịch sử đơn", "trạng thái đơn", "order", "đặt hàng của tôi", "tôi đặt", "đơn nào", "theo dõi đơn"];
    const productKeywords = ["giá", "bao nhiêu", "bán không", "có bán", "mua", "sản phẩm", "hàng", "tồn kho", "còn không", "kg", "tiền", "nhiêu", "nhiu"];
    if (orderKeywords.some((k) => lower.includes(k)))
        return "order";
    if (productKeywords.some((k) => lower.includes(k)))
        return "product";
    return "general";
}
//# sourceMappingURL=chat.tools.js.map