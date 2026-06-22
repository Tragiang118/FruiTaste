"use client";

import {
  Bot,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  User,
  X,
  Plus,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { useCartStore, useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/utils";
import api from "@/lib/axios";

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const ChatProductCard = ({ id, name, price, unit = "kg", stock = 0 }: { id: number, name: string, price: number, unit?: string, stock?: number }) => {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  // Tự fetch ảnh sản phẩm từ API
  useEffect(() => {
    if (!id) return;
    fetch(`${BACKEND_API}/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const img = data?.mediaUrls?.[0];
        if (img) setImageUrl(getImageUrl(img) || "");
      })
      .catch(() => {});
  }, [id]);

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      image: imageUrl,
      stockQuantity: stock,
      quantity: 1,
    });
    setAdded(true);
    toast.success(`Đã thêm ${name} vào giỏ hàng`);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm cursor-default" style={{ maxWidth: '280px', fontFamily: 'sans-serif', width: '100%', marginBottom: '1px' }}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="rounded-md"
          style={{ width: '56px', height: '56px', objectFit: 'cover', flexShrink: 0, backgroundColor: '#f9fafb' }}
        />
      ) : (
        <div
          className="rounded-md flex items-center justify-center"
          style={{ width: '56px', height: '56px', flexShrink: 0, backgroundColor: '#f0fdf4', fontSize: '24px' }}
        >
          🍎
        </div>
      )}
      <div className="flex-1 min-w-0" style={{ overflow: 'hidden' }}>
        <h4 className="font-bold text-sm text-gray-900 truncate m-0 leading-tight">{name}</h4>
        <p className="text-xs text-[#FF6B4A] font-semibold mt-1 mb-0 leading-none">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)} / {unit}
        </p>
        <p className="text-[10px] text-gray-500 mt-1 mb-0">Còn {stock} {unit}</p>
      </div>
      <button
        onClick={handleAddToCart}
        disabled={added}
        className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${added ? 'bg-green-500 text-white border-green-500' : 'bg-[#FFF4E6] text-[#FF6B4A] border-[#FFD8CD] hover:bg-[#FF6B4A] hover:text-white'}`}
        title="Thêm vào giỏ"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

// Component xác nhận đặt hàng trực tiếp trong chat
const ChatOrderForm = ({ productId, quantity }: { productId: number, quantity: number }) => {
  const { user } = useAuthStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Tự fetch thông tin sản phẩm và thông tin giao hàng mặc định của user
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const prodRes = await fetch(`${BACKEND_API}/products/${productId}`);
        const prodData = await prodRes.json();
        
        if (active) {
          setProduct(prodData);
        }

        const profileRes = await api.get('/auth/profile');
        const profile = profileRes.data;
        if (active && profile) {
          setShippingName(profile.fullName || "");
          setShippingPhone(profile.phone || "");
          
          const defaultAddr = profile.addresses?.find((a: any) => a.isDefault) || profile.addresses?.[0];
          if (defaultAddr) {
            setShippingName(defaultAddr.recipientName || profile.fullName || "");
            setShippingPhone(defaultAddr.phone || profile.phone || "");
            setShippingAddress(defaultAddr.fullAddress || "");
          }
        }
      } catch (err) {
        console.error("Fetch data for chatbot order form failed", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => { active = false; };
  }, [productId]);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center gap-2" style={{ fontFamily: 'sans-serif', maxWidth: '280px', width: '100%' }}>
        <Loader2 size={16} className="animate-spin text-green-500" />
        <span className="text-[11px] text-gray-500">Đang tải thông tin đặt hàng...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-[11px] text-red-600 font-medium" style={{ fontFamily: 'sans-serif', maxWidth: '280px' }}>
        Sản phẩm không khả dụng hoặc đã ngừng kinh doanh.
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="bg-green-50 p-3.5 rounded-2xl border border-green-200 text-[11px] text-green-800 space-y-2" style={{ fontFamily: 'sans-serif', maxWidth: '280px', width: '100%', marginBottom: '10px' }}>
        <div className="font-bold text-xs flex items-center gap-1">🎉 Đặt hàng thành công!</div>
        <p className="m-0 leading-relaxed">Đơn hàng <strong>#{orderSuccess.id}</strong> của bạn đã được tạo.</p>
        <p className="m-0 leading-relaxed">Hệ thống đang chuẩn bị giao hàng đến: <strong>{orderSuccess.shippingAddress}</strong>.</p>
        <p className="m-0 text-[10px] text-gray-500 italic leading-relaxed">Hóa đơn chi tiết đã được gửi tới email của bạn.</p>
      </div>
    );
  }

  const subtotal = product.price * quantity;
  const shippingFee = subtotal > 300000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const handleOrder = async () => {
    if (!shippingName.trim()) {
      setErrorMsg("Vui lòng nhập họ tên người nhận");
      return;
    }
    if (!shippingPhone.trim()) {
      setErrorMsg("Vui lòng nhập số điện thoại");
      return;
    }
    if (!shippingAddress.trim()) {
      setErrorMsg("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await api.post('/orders', {
        shippingName: shippingName.trim(),
        shippingPhone: shippingPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
        items: [{ productId: product.id, quantity, priceAtPurchase: product.price }],
        totalAmount: subtotal,
        shippingFee: shippingFee,
        finalAmount: total
      });

      const order = res.data;

      // Gửi email hóa đơn
      try {
        await fetch('/api/orders/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user?.email,
            firstName: user?.fullName?.split(' ').pop() || user?.fullName || 'Khách hàng',
            order,
          }),
        });
      } catch (e) {
        console.error("Failed to send chatbot invoice email", e);
      }

      setOrderSuccess(order);
      toast.success("Đặt hàng thành công!");
    } catch (err: any) {
      console.error("Chatbot checkout failed", err);
      const msg = err.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-md space-y-3 cursor-default" style={{ maxWidth: '280px', fontFamily: 'sans-serif', width: '100%', marginBottom: '10px' }}>
      <div className="border-b border-gray-100 pb-1.5">
        <h4 className="font-extrabold text-[12px] text-gray-900 m-0">📦 XÁC NHẬN ĐƠN HÀNG</h4>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs text-gray-900 truncate m-0">{product.name}</p>
          <p className="text-[10px] text-gray-500 m-0">Số lượng: {quantity} {product.unit || "kg"}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-xs text-[#FF6B4A] m-0">{(product.price * quantity).toLocaleString("vi-VN")} đ</p>
        </div>
      </div>

      {/* Thông tin giao hàng */}
      <div className="space-y-2 pt-0.5 text-[10px]">
        <div>
          <label className="block text-gray-500 font-semibold mb-0.5">Người nhận</label>
          <input
            type="text"
            value={shippingName}
            onChange={(e) => setShippingName(e.target.value)}
            placeholder="Nhập tên người nhận"
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-green-500 font-medium"
          />
        </div>
        <div>
          <label className="block text-gray-500 font-semibold mb-0.5">Số điện thoại</label>
          <input
            type="text"
            value={shippingPhone}
            onChange={(e) => setShippingPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-green-500 font-medium"
          />
        </div>
        <div>
          <label className="block text-gray-500 font-semibold mb-0.5">Địa chỉ giao hàng</label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Nhập địa chỉ giao hàng đầy đủ"
            rows={2}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none resize-none focus:border-green-500 font-medium"
          />
        </div>
        <div>
          <label className="block text-gray-500 font-semibold mb-0.5">Thanh toán</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-green-500 font-medium bg-white"
          >
            <option value="COD">Thanh toán khi nhận hàng (COD)</option>
            <option value="BANK_TRANSFER">Chuyển khoản QR Ngân hàng</option>
          </select>
        </div>
      </div>

      {paymentMethod === "BANK_TRANSFER" && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-2 flex flex-col items-center gap-1.5">
          <p className="text-[9px] text-orange-700 font-bold m-0 text-center">Quét QR chuyển khoản {(total).toLocaleString("vi-VN")} đ</p>
          <div className="w-28 h-28 bg-white p-1 rounded-lg border border-orange-100 flex items-center justify-center">
            <img
              src={`https://img.vietqr.io/image/970436-1014375356-qr_only.png?amount=${total}&addInfo=THANH%20TOAN%20FRUIT%20CHATBOT`}
              alt="QR Code"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Chi phí & Nút */}
      <div className="pt-2 border-t border-gray-100 space-y-1 text-[11px]">
        <div className="flex justify-between text-gray-500">
          <span>Tiền hàng</span>
          <span>{subtotal.toLocaleString("vi-VN")} đ</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Phí ship</span>
          <span>{shippingFee === 0 ? "Miễn phí" : `${shippingFee.toLocaleString("vi-VN")} đ`}</span>
        </div>
        <div className="flex justify-between font-extrabold text-gray-900 border-t border-gray-50 pt-1">
          <span>Tổng cộng</span>
          <span className="text-[#FF6B4A]">{total.toLocaleString("vi-VN")} đ</span>
        </div>

        {errorMsg && (
          <p className="text-[9px] text-red-600 font-bold m-0 pt-1 text-center">{errorMsg}</p>
        )}

        <button
          onClick={handleOrder}
          disabled={submitting}
          className="w-full mt-2.5 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-extrabold text-[11px] rounded-xl shadow-sm cursor-pointer transition-colors border-none flex items-center justify-center gap-1"
        >
          {submitting ? (
            <>
              <Loader2 size={10} className="animate-spin" />
              ĐANG ĐẶT HÀNG...
            </>
          ) : (
            "XÁC NHẬN ĐẶT HÀNG"
          )}
        </button>
      </div>
    </div>
  );
};

const QUICK_PROMPTS = [
  "Táo làm được món gì? 🍎",
  "Gợi ý combo smoothie 🥤",
  "Dâu tây kết hợp với gì ngon? 🍓",
];

// Kiểu tin nhắn nội bộ - đơn giản, không dùng useChat
type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  products?: any[];
  orderForm?: {
    productId: number;
    quantity: number;
  };
};

export default function ChatbotWidget() {
  const pathname = usePathname();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [hasError, setHasError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<number | null>(null);
  const savedCountRef = useRef(0);
  const canSubmit = input.trim().length > 0 && !isBusy;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBusy, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  // Hàm gửi tin nhắn và đọc stream thủ công
  const sendMessage = async (text: string) => {
    if (!text.trim() || isBusy) return;
    setHasError(false);

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", text: text.trim() };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: ChatMsg = { id: assistantId, role: "assistant", text: "", products: [] };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Parse sản phẩm từ tag [PRODUCT:id:name:price:unit:stock]
        const products: any[] = [];
        const productRegex = /\[PRODUCT:\s*([^:]+)\s*:\s*([^:]+)\s*:\s*([^:]+)\s*:\s*([^:]+)\s*:\s*([^\]]+)\]/gi;
        let match;
        while ((match = productRegex.exec(fullText)) !== null) {
          const [_, id, name, price, unit, stock] = match;
          const pId = id.trim();
          if (!products.some((p) => String(p.id) === pId)) {
            products.push({ id: pId, name: name.trim(), price: price.trim(), unit: unit.trim(), stock: stock.trim() });
          }
        }

        // Parse order form từ tag [ORDER_FORM:productId:quantity]
        let orderForm: any = undefined;
        const orderFormMatch = /\[ORDER_FORM:\s*([^:]+)\s*:\s*([^\]]+)\]/gi.exec(fullText);
        if (orderFormMatch) {
          const [_, pId, qty] = orderFormMatch;
          orderForm = { productId: parseInt(pId.trim(), 10), quantity: parseInt(qty.trim(), 10) };
        }

        // Dọn text hiển thị
        let cleanText = fullText
          .replace(/\[PRODUCT:[^\]]*\]/gi, "")
          .replace(/\[ORDER_FORM:[^\]]*\]/gi, "")
          .replace(/<[^>]*>.*?<\/[^>]*>/gs, "")
          .trim();

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, text: cleanText, products, orderForm } : m
          )
        );
      }

      // Lưu vào DB sau khi stream xong
      const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const userMsgsCount = messages.filter((m) => m.role === "user").length + 1;
      if (userMsgsCount > savedCountRef.current) {
        savedCountRef.current = userMsgsCount;
        const botText = fullText
          .replace(/\[PRODUCT:[^\]]*\]/gi, "")
          .replace(/\[ORDER_FORM:[^\]]*\]/gi, "")
          .trim();
        fetch(`${BACKEND}/chat/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            userMessage: text.trim(),
            botMessage: botText,
          }),
        })
          .then((res) => res.json())
          .then((data) => { if (data.sessionId) sessionIdRef.current = data.sessionId; })
          .catch(() => {});
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setHasError(true);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại." }
              : m
          )
        );
      }
    } finally {
      setIsBusy(false);
      abortRef.current = null;
    }
  };

  const stopStream = () => {
    abortRef.current?.abort();
  };

  // Tin nhắn chào mừng nếu chưa có gì
  const renderedMessages = messages.length > 0 ? messages : [
    {
      id: "chatbot-welcome",
      role: "assistant" as const,
      text: "Xin chào! Tôi là trợ lý AI của FruiTaste.\nHãy hỏi tôi về món ăn từ trái cây, gợi ý combo, hoặc bất cứ thứ gì về hoa quả nhé!",
      products: []
    },
  ];

  const isHiddenRoute =
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/profile";

  if (!mounted || isHiddenRoute) {
    return null;
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    const text = input.trim();
    setInput("");
    sendMessage(text);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {isOpen && (
        <div
          className="chatbot-widget-container"
          style={{
            marginBottom: "12px",
            width: "360px",
            height: "540px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: "24px",
            border: "1px solid #f3f4f6",
            backgroundColor: "#ffffff",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
            animation: "chatbotSlideIn 180ms ease-out",
          }}
        >
          <style>{`
            @keyframes chatbotSlideIn {
              from { opacity: 0; transform: translateY(16px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0)   scale(1); }
            }
            .chatbot-widget-container,
            .chatbot-widget-container * {
              font-family: var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "linear-gradient(to right, #22c55e, #16a34a)",
              padding: "16px",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "16px",
                backgroundColor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bot size={20} color="#fff" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#fff",
                  margin: 0,
                }}
              >
                FruitBot
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#bbf7d0",
                    display: "inline-block",
                    animation: "pulse 2s infinite",
                  }}
                />
                <p style={{ fontSize: "12px", color: "#dcfce7", margin: 0 }}>
                  Đang hoạt động
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                borderRadius: "999px",
                backgroundColor: "rgba(255,255,255,0.15)",
                padding: "4px 8px",
              }}
            >
              <Sparkles size={12} color="#fde047" />
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#fff" }}>
                Llama AI
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: "rgba(255,255,255,0.8)",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Đóng chatbot"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              backgroundColor: "rgba(249,250,251,0.5)",
            }}
          >
            {renderedMessages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  gap: "10px",
                  flexDirection:
                    message.role === "user" ? "row-reverse" : "row",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      message.role === "user" ? "#22c55e" : "#ffffff",
                    border:
                      message.role === "user"
                        ? "none"
                        : "2px solid #dcfce7",
                    boxShadow:
                      message.role === "user"
                        ? "none"
                        : "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  {message.role === "user" ? (
                    <User size={16} color="#fff" />
                  ) : (
                    <Bot size={16} color="#16a34a" />
                  )}
                </div>

                <div
                  style={{
                    maxWidth: "78%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems:
                      message.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      borderRadius:
                        message.role === "user"
                          ? "16px 4px 16px 16px"
                          : "4px 16px 16px 16px",
                      padding: "10px 14px",
                      fontSize: "14px",
                      lineHeight: 1.6,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                      backgroundColor:
                        message.role === "user" ? "#22c55e" : "#ffffff",
                      color: message.role === "user" ? "#fff" : "#374151",
                      border:
                        message.role === "user"
                          ? "none"
                          : "1px solid #f3f4f6",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {message.role === "user" ? (
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {message.text}
                      </div>
                    ) : (
                      <Streamdown mode="static" linkSafety={{ enabled: false }}>
                        {message.text}
                      </Streamdown>
                    )}
                  </div>

                  {(message.products && message.products.length > 0) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      {message.products.map((p: any, i: number) => (
                        <ChatProductCard
                          key={`${p.id}-${i}`}
                          id={Number(p.id)}
                          name={p.name}
                          price={Number(p.price) || 0}
                          unit={p.unit}
                          stock={Number(p.stock) || 0}
                        />
                      ))}
                    </div>
                  )}

                  {message.orderForm && (
                    <div style={{ marginTop: '8px', width: '100%' }}>
                      <ChatOrderForm
                        productId={message.orderForm.productId}
                        quantity={message.orderForm.quantity}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isBusy && (
              <div style={{ display: "flex", gap: "10px" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "2px solid #dcfce7",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    flexShrink: 0,
                  }}
                >
                  <Bot size={16} color="#16a34a" />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderRadius: "4px 16px 16px 16px",
                    border: "1px solid #f3f4f6",
                    backgroundColor: "#fff",
                    padding: "10px 14px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                  }}
                >
                  <Loader2
                    size={16}
                    color="#22c55e"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                    Đang soạn...
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Error */}
          {hasError && (
            <div
              style={{
                margin: "0 12px 4px",
                borderRadius: "12px",
                border: "1px solid #fecaca",
                backgroundColor: "#fef2f2",
                padding: "8px 12px",
                fontSize: "14px",
                color: "#b91c1c",
              }}
            >
              Đã xảy ra lỗi.{" "}
              <button
                type="button"
                onClick={() => {
                  const last = messages.filter((m) => m.role === "user").pop();
                  if (last) sendMessage(last.text);
                }}
                style={{
                  fontWeight: 500,
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#b91c1c",
                }}
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Quick prompts */}
          {renderedMessages.length <= 1 && !isBusy && (
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                borderTop: "1px solid #f9fafb",
                backgroundColor: "#fff",
                padding: "8px 12px",
              }}
            >
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  style={{
                    borderRadius: "999px",
                    border: "1px solid #bbf7d0",
                    backgroundColor: "#f0fdf4",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#15803d",
                    cursor: "pointer",
                    transition: "background 150ms",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#dcfce7")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f0fdf4")
                  }
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={onSubmit}
            style={{
              flexShrink: 0,
              borderTop: "1px solid #f3f4f6",
              backgroundColor: "#fff",
              padding: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (canSubmit) {
                      sendMessage(input.trim());
                      setInput("");
                    }
                  }
                }}
                placeholder="Hỏi về hoa quả, món ăn..."
                style={{
                  flex: 1,
                  borderRadius: "999px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                  padding: "10px 16px",
                  fontSize: "14px",
                  outline: "none",
                  color: "#111827",
                }}
                disabled={isBusy}
              />
              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: canSubmit ? "#22c55e" : "#d1d5db",
                  border: "none",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 150ms, transform 150ms",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (canSubmit)
                    e.currentTarget.style.backgroundColor = "#16a34a";
                }}
                onMouseLeave={(e) => {
                  if (canSubmit)
                    e.currentTarget.style.backgroundColor = "#22c55e";
                }}
              >
                <Send size={16} color="#fff" />
              </button>
            </div>
            {isBusy && (
              <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => stopStream()}
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#dc2626",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Dừng phản hồi
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Toggle button */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            position: "relative",
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(34,197,94,0.4)",
            transition: "transform 150ms, box-shadow 150ms",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(34,197,94,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(34,197,94,0.4)";
          }}
          aria-label={isOpen ? "Đóng chatbot AI" : "Mở chatbot AI"}
        >
          {isOpen ? (
            <X size={24} color="#fff" />
          ) : (
            <MessageCircle size={24} color="#fff" />
          )}
          {!isOpen && (
            <span
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "#f97316",
                border: "2px solid #fff",
                animation: "pulse 2s infinite",
              }}
            />
          )}
        </button>
      </div>
    </div>
  );
}
