'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Package, Truck, CheckCircle2, Copy, FileText, XCircle, Home, ChevronRight, Store } from 'lucide-react';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';

interface OrderDetail {
  id: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  createdAt: string;
  items: Array<{
    id: number;
    quantity: number;
    priceAtPurchase: number;
    product: {
      id: number;
      name: string;
      mediaUrls?: string[];
    };
  }>;
}

export default function CheckoutSuccessDetailPage() {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  // Tính phí ship động theo tổng tiền hàng
  let dynamicShippingFee = order?.shippingFee ?? 0;
  if (order && order.totalAmount < 100000) {
    dynamicShippingFee = 25000;
  }

  useEffect(() => {
    if (!orderId) return;
    const fetchOrderDetail = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        alert('Không tìm thấy đơn hàng này.');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [orderId, router]);

  if (loading) return <div className="text-center py-20 text-gray-500 min-h-screen">Đang tải thông tin đơn hàng vừa đặt...</div>;
  if (!order) return null;

  const steps = [
    { key: 'PENDING', label: 'Chờ xác nhận', icon: <FileText className="w-6 h-6" /> },
    { key: 'CONFIRMED', label: 'Đã xác nhận. Đang chuẩn bị hàng', icon: <Package className="w-6 h-6" /> },
    { key: 'SHIPPING', label: 'Đang giao hàng', icon: <Truck className="w-6 h-6" /> },
    { key: 'COMPLETED', label: 'Đã nhận được hàng', icon: <CheckCircle2 className="w-6 h-6" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Breadcrumb cho trang sau khi đặt hàng */}
        <div className="flex items-center justify-between w-full mb-8 mt-4">
          <BackButton className="px-0 h-auto mb-0" />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1"><Home size={14} /> Trang chủ</Link>
            <ChevronRight size={14} />
            <Link href="/checkout" className="hover:text-[#FF6B4A]">Thanh toán</Link>
            <ChevronRight size={14} />
            <span className="text-[#FF6B4A] font-medium truncate">Đặt hàng thành công</span>
          </div>
        </div>

        <div className="space-y-4 shadow-sm pb-10 bg-white rounded-3xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-primary to-green-600 text-white min-h-[160px] flex items-center justify-between">
            <div className="space-y-2 max-w-sm">
              <h1 className="text-3xl font-black">{isCancelled ? 'Đơn Đã Hủy' : 'Đặt hàng thành công!'}</h1>
              <p className="text-sm text-green-50 opacity-90 leading-relaxed">
                Cảm ơn bạn đã mua sắm tại FruiTaste. Chúng tôi sẽ sớm giao hàng đến bạn!
              </p>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-sm shadow-sm opacity-80 backdrop-filter gap-1 flex justify-center items-center">
                MÃ ĐƠN: #{order.id}
                <div title="Sao chép" onClick={() => navigator.clipboard.writeText(order.id.toString())} className="cursor-pointer hover:text-white transition-colors">
                  <Copy size={12} />
                </div>
              </span>
              <span className="text-sm font-medium mt-1 text-green-100">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
            </div>
          </div>

          {!isCancelled && (
            <div className="px-6 py-10 bg-white border-b border-gray-100 overflow-x-auto">
              <div className="flex items-center justify-between relative min-w-[600px] max-w-3xl mx-auto">
                <div className="absolute top-1/2 left-[10%] right-[10%] h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />
                {currentStepIndex >= 0 && (
                  <div
                    className="absolute top-1/2 left-[10%] h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-1000"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 80}%` }}
                  />
                )}
                {steps.map((step, idx) => {
                  const active = idx <= currentStepIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-3 relative z-10 w-1/4">
                      <div className={`w-12 h-12 rounded-full flex justify-center items-center font-bold outline outline-4 outline-white shadow-sm transition-colors duration-500 ${active ? 'bg-primary text-white border-2 border-primary' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                        {step.icon}
                      </div>
                      <span className={`text-xs font-bold text-center w-full max-w-[100px] leading-tight ${active ? 'text-primary' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-6 bg-white border-b border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Địa Chỉ Nhận Hàng</h2>
            <div className="flex gap-4 items-start text-gray-700 max-w-xl">
              <MapPin className="text-primary w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-gray-900">{order.shippingName}</span>
                <span className="text-gray-600 text-sm">{order.shippingPhone}</span>
                <span className="text-gray-500 text-sm mt-1">{order.shippingAddress}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-4 flex gap-2"><Store className="w-5 h-5 text-primary" /> Chi tiết sản phẩm</h2>
            <div className="space-y-6">
              {order.items?.map((item) => (
                <Link href={`/products/${item.product.id}`} key={item.id} className="flex gap-4 group">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 group-hover:ring-2 ring-primary ring-offset-2 transition-all">
                    {item.product.mediaUrls?.[0] ? (
                      <img src={getImageUrl(item.product.mediaUrls[0])} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">{item.product.name}</h4>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Số lượng: x{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.priceAtPurchase)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white">
            <div className="ml-auto w-full md:w-1/2 space-y-3 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Tổng tiền hàng:</span>
                <span className="font-medium text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="font-medium text-gray-900">{dynamicShippingFee === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dynamicShippingFee)}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
                <span className="font-medium text-gray-900 text-base">Thành tiền:</span>
                <span className="font-black text-2xl text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Link href="/orders">
            <Button className="rounded-full px-8">Quản lý đơn hàng</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="rounded-full px-8">Về trang chủ</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
