'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Package, Truck, CheckCircle2, Copy, FileText, XCircle, Home, ChevronRight, Store, ShieldCheck } from 'lucide-react';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { getImageUrl } from '@/lib/utils';

interface OrderItem {
  id: number;
  quantity: number;
  priceAtPurchase: number;
  product: {
    id: number;
    name: string;
    mediaUrls?: string[];
  };
}

interface OrderDetail {
  id: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  cancelledBy?: 'USER' | 'ADMIN';
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  createdAt: string;
  items: OrderItem[];
  confirmedAt?: string;
  preparingAt?: string;
  shippingAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function OrderDetailPage() {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const isAdminView = searchParams.get('role') === 'admin';

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
        console.log('API Response Order:', res.data);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        alert('Không tìm thấy đơn hàng này.');
        router.push(isAdminView ? '/admin/orders' : '/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [orderId, router, isAdminView]);

  if (loading) return <div className="text-center py-20 text-gray-500 min-h-screen">Đang tìm dữ liệu đơn hàng...</div>;
  if (!order) return null;

  // Timeline UI (Shopee style progress bar)
  const steps = [
    { key: 'PENDING', label: 'Chờ xác nhận', icon: <FileText className="w-6 h-6" />, time: order.createdAt },
    { key: 'CONFIRMED', label: 'Đã xác nhận', icon: <ShieldCheck className="w-6 h-6" />, time: order.confirmedAt },
    { key: 'PREPARING', label: 'Đang chuẩn bị', icon: <Package className="w-6 h-6" />, time: order.preparingAt },
    { key: 'SHIPPING', label: 'Đang giao hàng', icon: <Truck className="w-6 h-6" />, time: order.shippingAt },
    { key: 'COMPLETED', label: 'Hoàn thành', icon: <CheckCircle2 className="w-6 h-6" />, time: order.completedAt },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between w-full mb-8 mt-4">
          <BackButton className="px-0 h-auto mb-0" />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {isAdminView ? (
              <>
                <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1 font-medium"><Home size={14} />Trang chủ</Link>
                <ChevronRight size={14} />
                <Link href="/admin" className="hover:text-[#FF6B4A] font-medium">Quản trị</Link>
                <ChevronRight size={14} />
                <Link href="/admin/orders" className="hover:text-[#FF6B4A] font-medium">Quản lý đơn hàng</Link>
              </>
            ) : (
              <>
                <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1 font-medium"><Home size={14} />Trang chủ</Link>
                <ChevronRight size={14} />
                <Link href="/orders" className="hover:text-[#FF6B4A] font-medium text-[#FF6B4A]">Đơn hàng</Link>
              </>
            )}
            <ChevronRight size={14} />
            <span className="text-[#FF6B4A] font-medium text-[#FF6B4A]">Chi tiết đơn hàng #{order.id}</span>
          </div>
        </div>
        <div className="space-y-4 shadow-sm pb-10 bg-white rounded-3xl overflow-hidden">

          {/* Header - Trạng thái & Lịch sử */}
          <div className="p-6 bg-gradient-to-r from-primary to-green-600 text-white min-h-[140px] flex items-center justify-between">
            <div className="space-y-1.5 max-w-sm">
              <h1 className="text-2xl font-black">{isCancelled ? 'Đơn Đã Hủy' : 'Đang xử lý kiện hàng...'}</h1>
              <p className="text-xs text-green-50 opacity-90 leading-relaxed">
                Cảm ơn các bạn đã mua hoa quả tại FruiTaste! Đơn hàng được đóng gói kiểm tra kĩ lưỡng nhất.
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
              <div className="flex items-center justify-between relative min-w-[650px] max-w-3xl mx-auto">
                <div className="absolute top-[24px] left-[10%] right-[10%] h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />
                {currentStepIndex >= 0 && (
                  <div
                    className="absolute top-[24px] left-[10%] h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-1000"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 80}%` }}
                  />
                )}
                {steps.map((step, idx) => {
                  const active = idx <= currentStepIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-3 relative z-10 flex-1">
                      <div className={`w-12 h-12 rounded-full flex justify-center items-center font-bold outline outline-4 outline-white shadow-sm transition-colors duration-500 ${active ? 'bg-primary text-white border-2 border-primary' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                        {step.icon}
                      </div>
                      <span className={`text-[10px] font-bold text-center w-full max-w-[80px] leading-tight ${active ? 'text-primary' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                      {step.time && (
                        <span className="text-[9px] text-gray-400 font-medium text-center mt-1">
                          {format(new Date(step.time), "HH:mm dd/MM", { locale: vi })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="px-6 pb-6">
              <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm">
                  <XCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-red-600 text-[13px]">
                    {order.cancelledBy === 'USER'
                      ? 'Bạn đã chủ động hủy đơn hàng này'
                      : order.cancelledBy === 'ADMIN'
                        ? 'Đơn hàng này đã bị cửa hàng hủy'
                        : 'Đơn hàng đã được hủy'}
                  </h3>
                  <p className="text-[11px] text-red-400 font-medium mt-0.5">
                    {order.cancelledBy === 'USER'
                      ? 'Cảm ơn bạn đã quan tâm. Hy vọng sẽ được phục vụ bạn ở đơn hàng sau nhé!'
                      : order.cancelledBy === 'ADMIN'
                        ? 'Vui lòng quay lại cửa hàng nếu cần mua lại sản phẩm hoặc liên hệ hỗ trợ nhé.'
                        : 'Đơn hàng đã được hủy thành công. Vui lòng quay lại cửa hàng nếu cần mua lại sản phẩm.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Thông tin vận chuyển */}
          <div className="p-6 bg-white border-b border-gray-100 space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-2">Địa Chỉ Nhận Hàng</h2>
            <div className="flex gap-4 items-start text-gray-700 max-w-xl">
              <MapPin className="text-primary w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-gray-900 text-sm">{order.shippingName}</span>
                <span className="text-gray-600 text-xs">{order.shippingPhone}</span>
                <span className="text-gray-500 text-xs mt-1">{order.shippingAddress}</span>
              </div>
            </div>
          </div>
          {/* Sản phẩm đã đặt */}
          <div className="p-6 bg-white border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-3 mb-3 flex gap-2"><Store className="w-4 h-4 text-primary" /> Chi tiết sản phẩm</h2>
            <div className="space-y-5">
              {order.items?.map((item) => (
                <Link href={`/products/${item.product.id}`} key={item.id} className="flex gap-4 group">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 group-hover:ring-2 ring-primary ring-offset-2 transition-all">
                    {item.product.mediaUrls?.[0] ? (
                      <img src={getImageUrl(item.product.mediaUrls[0])} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-primary transition-colors">{item.product.name}</h4>
                    <p className="text-gray-500 text-[10px] mt-1 font-bold uppercase tracking-tight">Số lượng: x{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.priceAtPurchase)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Tổng kết thanh toán */}
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
                <span className="font-medium text-gray-900 text-sm">Thành tiền:</span>
                <span className="font-black text-xl text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Nút hủy đơn hàng - Chỉ hiển thị cho khách hàng khi đơn hàng đang CHỜ XÁC NHẬN */}
          {order.status === 'PENDING' && !isAdminView && (
            <div className="p-6 pt-0 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsCancelModalOpen(true)}
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 font-bold px-8 h-10 rounded-full transition-all shadow-none"
              >
                Hủy đơn hàng
              </Button>
            </div>
          )}
        </div>

        {/* AlertDialog xác nhận hủy đơn hàng - Giống trang Quản lý User */}
        <AlertDialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
          <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900">Xác nhận hủy đơn hàng</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Bạn có chắc chắn muốn hủy đơn hàng <b className="text-gray-900">#{order.id}</b> không?
                Hành động này sẽ hoàn lại số lượng sản phẩm vào kho và không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 pt-4">
              <AlertDialogCancel disabled={isCancelling} className="rounded-full border-gray-200 font-bold text-gray-600 h-10 px-6">
                Quay lại
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isCancelling}
                onClick={async (e) => {
                  e.preventDefault(); // Ngăn đóng modal tự động để xử lý async
                  setIsCancelling(true);
                  try {
                    await api.post(`/orders/${order.id}/status`, { status: 'CANCELLED' });
                    setIsCancelModalOpen(false);
                    window.location.reload();
                  } catch (err: any) {
                    alert(err.response?.data?.message || 'Không thể hủy đơn hàng này.');
                    setIsCancelling(false);
                  }
                }}
                className="rounded-full bg-red-500 hover:bg-red-600 text-white font-bold h-10 px-6 border-none shadow-lg shadow-red-200 transition-all"
              >
                {isCancelling ? 'Đang xử lý...' : 'Xác nhận hủy đơn'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
