'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore, useAuthStore } from '@/lib/store';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { CreditCard, ChevronRight, PackageCheck, ShoppingBag, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';
import AddressSection from '@/components/checkout/AddressSection';
import BackButton from '@/components/BackButton';
import { toast } from 'sonner';
import { cn, getImageUrl } from '@/lib/utils';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
  FieldGroup,
  FieldSet,
} from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function CheckoutPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { items: allItems, removeItem, selectedIds, setSelectedIds } = useCartStore();
  const searchParams = useSearchParams();
  const buyNowId = searchParams.get('buyNow');
  const buyNowQty = Number(searchParams.get('qty')) || 1;

  // Lọc lấy các sản phẩm đã chọn từ giỏ hàng
  const items = buyNowId
    ? allItems.filter(i => i.id === Number(buyNowId)).map(i => ({ ...i, quantity: buyNowQty }))
    : allItems.filter(i => selectedIds.includes(i.id));

  const [hiddenProductError, setHiddenProductError] = useState<{ message: string, productId: number | null } | null>(null);
  const router = useRouter();

  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [transferContent, setTransferContent] = useState('THANH TOAN FRUIT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOffHours = () => {
    const hour = new Date().getHours();
    return hour >= 21 || hour < 8;
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (selectedAddress) {
      const name = selectedAddress.recipientName || '';
      const phone = selectedAddress.phone || '';
      setTransferContent(`${name} ${phone} Thanh toán FruiTaste`.trim());
    }
  }, [selectedAddress]);

  // Đồng bộ giỏ hàng từ server khi vào trang checkout, cảnh báo nếu số lượng bị giảm
  const hasSynced = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || isLoading || hasSynced.current) return;
    hasSynced.current = true;

    const syncCart = async () => {
      try {
        const res = await api.get('/cart');
        const freshItems: typeof allItems = res.data.items;
        const prevItems = allItems;

        // Kiểm tra xem có sản phẩm nào bị giảm số lượng không
        const reduced = freshItems.filter(fresh => {
          const old = prevItems.find(p => p.id === fresh.id);
          return old && fresh.quantity < old.quantity;
        });

        useCartStore.getState().overwriteItems(freshItems);

        if (reduced.length > 0) {
          const names = reduced.map(r => r.name).join(', ');
          toast.warning(
            `Số lượng một số sản phẩm đã được điều chỉnh theo tồn kho thực tế: ${names}`,
            { duration: 6000 }
          );
        }
      } catch (e) {
        console.error('Sync cart failed', e);
      }
    };

    syncCart();
  }, [isAuthenticated, isLoading]);

  // Nếu không có sản phẩm nào được chọn, chuyển hướng về giỏ hàng (mở giỏ hàng ở trang products)
  useEffect(() => {
    if (!isLoading && isAuthenticated && items.length === 0) {
      // toast.info('Vui lòng chọn sản phẩm trong giỏ hàng để thanh toán');
      // router.push('/products');
    }
  }, [items, isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Đang kiểm tra thông tin...</div>;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có sản phẩm nào được chọn</h2>
        <p className="text-gray-500 mb-8 max-w-md">Hãy quay lại giỏ hàng và chọn những trái cây bạn muốn mua nhé.</p>
        <Link href="/products">
          <Button className="bg-primary hover:bg-green-600 px-10 h-14 rounded-full font-bold text-lg shadow-lg">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 300000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      toast.error('Vui lòng chọn hoặc thêm địa chỉ nhận hàng');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/orders', {
        shippingName: selectedAddress.recipientName,
        shippingPhone: selectedAddress.phone,
        shippingAddress: selectedAddress.fullAddress,
        paymentMethod,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity, priceAtPurchase: i.price })),
        totalAmount: subtotal,
        shippingFee: shippingFee,
        finalAmount: total
      });

      const order = res.data;

      // Gửi email hóa đơn (await - bắt buộc phải gửi được)
      try {
        const emailRes = await fetch('/api/orders/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user?.email,
            firstName: user?.fullName?.split(' ').pop() || user?.fullName || 'Khách hàng',
            order,
          }),
        });
        if (!emailRes.ok) {
          toast.warning('Đơn hàng đã đặt thành công, nhưng gửi email hóa đơn thất bại.');
        }
      } catch (emailErr) {
        console.error('[send-invoice] Lỗi gửi email:', emailErr);
        toast.warning('Đơn hàng đã đặt thành công, nhưng gửi email hóa đơn thất bại.');
      }

      // CHỈ XÓA CÁC SẢN PHẨM ĐÃ ĐẶT HÀNG KHỎI GIỎ HÀNG
      for (const item of items) {
        await removeItem(item.id);
      }
      setSelectedIds([]); // Clear danh sách chọn sau khi đặt thành công

      router.push('/checkout/success?orderId=' + order.id);
    } catch (err: any) {
      console.error("Lỗi đặt hàng:", err);
      let msg = "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!";
      let productId: number | null = null;
      if (err.response && err.response.data) {
        msg = err.response.data.message || msg;
        if (err.response.data.productId) {
          productId = Number(err.response.data.productId);
        } else {
          // Fallback: Tìm xem có sản phẩm nào có tên nằm trong tin nhắn lỗi không
          const matchedItem = items.find(item => msg.includes(item.name));
          if (matchedItem) {
            productId = matchedItem.id;
          } else if (msg.includes('không còn khả dụng') || msg.includes('đã bị ẩn') || msg.includes('không đủ tồn kho')) {
            if (items.length > 0) productId = items[0].id;
          }
        }
      }
      setHiddenProductError({ message: msg, productId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#F6FBF6] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between w-full mb-8">
          <BackButton className="px-0 h-auto mb-0" />
          <div className="flex items-center text-sm text-gray-400 font-medium">
            <Link href="/products" className="hover:text-primary transition-colors">Trái cây</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-primary font-bold">Thanh toán</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {isOffHours() && (
              <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 flex gap-4 items-center shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <Clock size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-900 text-sm uppercase tracking-wider">Thông báo giờ hoạt động</h4>
                  <p className="text-amber-800 text-xs leading-relaxed font-medium">
                    Cửa hàng sẽ mở lại vào lúc <span className="font-black">9h sáng</span>. Bạn có thể đặt trước ngay bây giờ và chúng tôi sẽ chuẩn bị, giao hàng cho bạn sớm nhất từ 9h!
                  </p>
                </div>
              </div>
            )}

            {/* Shopee-style Address Section */}
            <AddressSection
              selectedId={selectedAddress?.id}
              onAddressChange={setSelectedAddress}
            />

            {/* Payment Method Section */}
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden p-0">
              <CardHeader className="bg-white border-b border-gray-50 p-5">
                <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="gap-4"
                >
                  <FieldLabel
                    className={cn(
                      "bg-white cursor-pointer rounded-[2rem] border-2 transition-all p-2 overflow-hidden",
                      paymentMethod === 'COD' ? "border-primary shadow-md" : "border-gray-50 hover:border-gray-200"
                    )}
                    htmlFor="COD"
                  >
                    <Field orientation="horizontal" className="p-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                        paymentMethod === 'COD' ? "bg-primary/10 text-primary" : "bg-gray-50 text-gray-400"
                      )}>
                        <PackageCheck size={24} />
                      </div>
                      <FieldContent className="ml-2">
                        <FieldTitle className="text-base font-bold text-gray-900">Thanh toán khi nhận hàng (COD)</FieldTitle>
                        <FieldDescription className="text-xs text-gray-500">Thanh toán bằng tiền mặt khi shipper giao tới</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem id="COD" value="COD" className="ml-auto" />
                    </Field>
                  </FieldLabel>

                  <FieldLabel
                    className={cn(
                      "bg-white cursor-pointer rounded-[2rem] border-2 transition-all p-2 overflow-hidden",
                      paymentMethod === 'BANK_TRANSFER' ? "border-primary shadow-md" : "border-gray-50 hover:border-gray-200"
                    )}
                    htmlFor="BANK_TRANSFER"
                  >
                    <Field orientation="horizontal" className="p-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                        paymentMethod === 'BANK_TRANSFER' ? "bg-primary/10 text-primary" : "bg-gray-50 text-gray-400"
                      )}>
                        <CreditCard size={24} />
                      </div>
                      <FieldContent className="ml-2">
                        <FieldTitle className="text-base font-bold text-gray-900">Chuyển khoản Ngân hàng (QR Code)</FieldTitle>
                        <FieldDescription className="text-xs text-gray-500">Quét mã VietQR nhanh chóng và an toàn</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem id="BANK_TRANSFER" value="BANK_TRANSFER" className="ml-auto" />
                    </Field>
                  </FieldLabel>
                </RadioGroup>

                {paymentMethod === 'BANK_TRANSFER' && (
                  <div className="mt-8 p-8 rounded-[2.5rem] bg-orange-50/50 border border-orange-100/50 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-orange-200/20 border border-white flex-shrink-0">
                        <div className="size-64 flex items-center justify-center bg-white">
                          <img
                            src={`https://img.vietqr.io/image/970436-1014375356-qr_only.png?amount=${total}&addInfo=${encodeURIComponent(transferContent.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D"))}`}
                            alt="QR Thanh toán"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      <div className="flex-1 space-y-4 text-center md:text-left">
                        <div>
                          <h4 className="text-sm font-black text-orange-600 uppercase tracking-widest mb-1">Thông tin chuyển khoản</h4>
                          <p className="text-2xl font-black text-gray-900 tracking-tight">Ngân hàng Vietcombank</p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số tài khoản</span>
                            <span className="text-xl font-bold text-primary tabular-nums">1014375356</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chủ tài khoản</span>
                            <span className="text-lg font-bold text-gray-800 uppercase">NGUYEN TRA GIANG</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số tiền</span>
                            <span className="text-xl font-black text-gray-900 tabular-nums">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nội dung chuyển khoản</span>
                            <input
                              type="text"
                              value={transferContent}
                              onChange={(e) => setTransferContent(e.target.value)}
                              className="w-full px-4 py-2 bg-white rounded-xl border border-orange-100 text-sm font-bold text-orange-600 focus:outline-none focus:border-primary transition-colors"
                              placeholder="Nhập nội dung chuyển khoản"
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-white/60 rounded-xl border border-white text-[11px] text-gray-500 font-medium leading-relaxed italic">
                          Lưu ý: Bạn có thể sửa nội dung chuyển khoản ở ô bên trên để chúng tôi dễ dàng xác nhận đơn hàng của bạn hơn.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-5">
            <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden sticky top-24 p-0">
              <CardHeader className="bg-gray-900 text-white p-6">
                <CardTitle className="text-xl font-black uppercase tracking-tight">Chi tiết đơn hàng</CardTitle>
                <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest">{items.length} sản phẩm được chọn</p>
              </CardHeader>
              <CardContent className="p-8 bg-white">
                <div className="space-y-6 max-h-[35vh] overflow-y-auto pr-4 custom-scrollbar">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-5 items-center group">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 transition-transform group-hover:scale-105">
                        <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-gray-900 truncate">{item.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-500 font-medium">Số lượng: {item.quantity}</p>
                          <span className="font-bold text-primary">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Tạm tính</span>
                    <span className="text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Phí giao hàng</span>
                    <span className="text-gray-900">{shippingFee === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-8 bg-gray-50 flex-col gap-6">
                <div className="flex justify-between w-full items-center">
                  <span className="text-gray-900 font-black text-base tracking-tight">TỔNG CỘNG:</span>
                  <span className="text-2xl font-black text-primary leading-none">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                  </span>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedAddress}
                  className="w-full rounded-2xl py-6 text-lg font-black uppercase tracking-widest shadow-lg transition-all hover:translate-y-[-2px] active:translate-y-[0px]"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'Xác nhận Đặt hàng'}
                </Button>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Cam kết sản phẩm tươi ngon 100%</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Product Error Dialog */}
      <AlertDialog open={!!hiddenProductError} onOpenChange={(open) => { if (!open) setHiddenProductError(null); }}>
        <AlertDialogContent className="bg-white rounded-3xl max-w-[400px] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-red-600">Lỗi đơn hàng</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-medium mt-4 leading-relaxed">
              {hiddenProductError?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col gap-3 sm:flex-col">
            <AlertDialogAction
              className="w-full rounded-2xl bg-primary hover:bg-green-600 text-white h-12 font-bold uppercase tracking-wider"
              onClick={async () => {
                if (hiddenProductError?.productId) {
                  await removeItem(hiddenProductError.productId);
                }
                setHiddenProductError(null);
                window.location.reload();
              }}
            >
              Đồng ý, xóa và tải lại
            </AlertDialogAction>
            <AlertDialogCancel className="w-full rounded-2xl border-none bg-gray-100 hover:bg-gray-200 text-gray-500 h-12 font-bold uppercase tracking-wider" onClick={() => { setHiddenProductError(null); router.push('/products'); }}>Trở về cửa hàng</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
