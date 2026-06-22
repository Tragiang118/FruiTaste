'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Package, User, Phone, MapPin, CreditCard, ChevronDown, CheckCircle2, Clock, Truck, Box, XCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { cn, getImageUrl } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';

interface OrderDetailsDialogProps {
  orderId: number;
  onUpdate: (showLoading?: boolean) => void;
}

export default function OrderDetailsDialog({ orderId, onUpdate }: OrderDetailsDialogProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (error) {
      toast.error("Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'CANCELLED') {
      setPendingStatus('CANCELLED');
      setShowCancelAlert(true);
      return;
    }

    await executeStatusChange(newStatus);
  };

  const executeStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true);
      await api.post(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Cập nhật trạng thái thành công");
      fetchOrderDetails();
      onUpdate(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    } finally {
      setUpdating(false);
      setPendingStatus(null);
    }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true);
      await api.post(`/orders/${orderId}/payment-status`, { status: newStatus });
      toast.success("Cập nhật trạng thái thanh toán thành công");
      fetchOrderDetails();
      onUpdate(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái thanh toán");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'CONFIRMED': return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case 'PREPARING': return <Box className="w-4 h-4 text-amber-500" />;
      case 'SHIPPING': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'CONFIRMED': return 'Đã duyệt';
      case 'PREPARING': return 'Đang chuẩn bị';
      case 'SHIPPING': return 'Đang giao';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && fetchOrderDetails()}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full cursor-pointer"
        >
          <Eye size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] md:max-w-3xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
        <DialogHeader className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 space-y-0 text-left">
          <div className="flex-1">
            <DialogTitle className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Package size={20} />
              </div>
              <span className="leading-tight">Chi tiết đơn hàng #{orderId}</span>
            </DialogTitle>
            {order && (
              <p className="text-sm text-gray-500 mt-1 font-medium ml-13">
                Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            )}
          </div>

          {order && (
            <div className="w-full md:w-auto shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={updating || order.status === 'CANCELLED'}
                    className={cn(
                      "w-full md:w-auto rounded-full font-bold px-6 h-10 border transition-all cursor-pointer",
                      order.status === 'COMPLETED' ? "bg-green-50 text-green-600 border-green-100" :
                        order.status === 'CANCELLED' ? "bg-red-50 text-red-500 border-red-100 opacity-80" :
                          "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {updating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : getStatusIcon(order.status)}
                    <span className="mx-2 truncate">{getStatusLabel(order.status)}</span>
                    {order.status !== 'CANCELLED' && <ChevronDown size={16} className="opacity-50 ml-auto" />}
                  </Button>
                </DropdownMenuTrigger>
                {order.status !== 'CANCELLED' && (
                  <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-gray-100 p-2 bg-white" align="end">
                    <DropdownMenuLabel className="text-sm font-bold text-gray-700 ml-1">Cập nhật trạng thái</DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1 bg-gray-50" />
                    <DropdownMenuRadioGroup value={order.status} onValueChange={handleStatusChange}>
                      <DropdownMenuRadioItem value="PENDING" className="cursor-pointer rounded-xl p-2.5 px-3 py-2 pr-10 font-bold text-blue-400 text-xs transition-colors">Chờ xác nhận</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="CONFIRMED" className="cursor-pointer rounded-xl p-2.5 px-3 py-2 pr-10 font-bold text-blue-600 text-xs transition-colors">Đã duyệt</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="PREPARING" className="cursor-pointer rounded-xl p-2.5 px-3 py-2 pr-10 font-bold text-amber-600 text-xs transition-colors">Đang chuẩn bị</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="SHIPPING" className="cursor-pointer rounded-xl p-2.5 px-3 py-2 pr-10 font-bold text-purple-600 text-xs transition-colors">Đang giao</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="COMPLETED" className="cursor-pointer rounded-xl p-2.5 px-3 py-2 pr-10 font-bold text-green-600 text-xs transition-colors">Hoàn thành</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="CANCELLED" className="cursor-pointer rounded-xl p-2.5 px-3 py-2 pr-10 font-bold text-red-500 text-xs transition-colors">Hủy đơn hàng</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
            </div>
          )}
        </DialogHeader>

        <div className="p-6 md:p-8 space-y-8 max-h-[70vh] overflow-y-auto bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw className="animate-spin text-primary w-10 h-10" />
              <p className="text-gray-400 font-bold">Đang tải thông tin...</p>
            </div>
          ) : order ? (
            <>
              {/* Status Timeline */}
              {order.status !== 'CANCELLED' && (
                <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm overflow-x-auto">
                  <div className="flex items-center justify-between relative min-w-[500px] max-w-2xl mx-auto py-4">
                    <div className="absolute top-[24px] left-[10%] right-[10%] h-0.5 bg-gray-100 -translate-y-1/2 z-0" />

                    {[
                      { key: 'PENDING', label: 'Chờ xác nhận', time: order.createdAt },
                      { key: 'CONFIRMED', label: 'Đã duyệt', time: order.confirmedAt },
                      { key: 'PREPARING', label: 'Đang chuẩn bị', time: order.preparingAt },
                      { key: 'SHIPPING', label: 'Đang giao', time: order.shippingAt },
                      { key: 'COMPLETED', label: 'Hoàn thành', time: order.completedAt },
                    ].map((step, idx, arr) => {
                      const stepsKeys = arr.map(s => s.key);
                      const currentIdx = stepsKeys.indexOf(order.status);
                      const isCompleted = idx <= currentIdx;

                      return (
                        <div key={step.key} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex justify-center items-center shadow-sm transition-all border-4 border-white",
                            isCompleted ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                          )}>
                            {isCompleted ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={cn("text-[10px] font-bold text-center whitespace-nowrap", isCompleted ? "text-primary" : "text-gray-400")}>
                              {step.label}
                            </span>
                            {step.time && (
                              <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap">
                                {format(new Date(step.time), "HH:mm dd/MM", { locale: vi })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {order.status === 'CANCELLED' && (
                <div className="bg-red-50 border border-red-100 rounded-[2rem] p-6 flex items-center gap-4 text-red-600">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                    <XCircle size={24} />
                  </div>
                  <div>
                    <p className="font-black text-lg">
                      {order.cancelledReason === 'SYSTEM'
                        ? 'Đơn hàng bị hệ thống tự động hủy'
                        : order.cancelledReason === 'ADMIN'
                          ? 'Đơn hàng bị admin hủy'
                          : order.cancelledReason === 'USER'
                            ? 'Đơn hàng bị khách hàng tự hủy'
                            : order.cancelledBy === 'USER'
                              ? 'Đơn hàng bị khách hàng hủy'
                              : order.cancelledBy === 'ADMIN'
                                ? 'Đơn hàng bị hệ thống/admin hủy'
                                : 'Đơn hàng đã bị hủy'}
                    </p>
                    {order.cancelledAt && (
                      <p className="text-sm font-medium opacity-80 italic">Thời gian hủy: {format(new Date(order.cancelledAt), "HH:mm:ss dd/MM/yyyy", { locale: vi })}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-50">
                  <h4 className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2 mb-4">
                    <User size={14} className="text-primary" /> Thông tin người nhận
                  </h4>
                  <div className="space-y-3">
                    <p className="text-lg font-black text-gray-900">{order.shippingName}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-2 font-medium">
                      <Phone size={14} className="text-gray-400" /> {order.shippingPhone}
                    </p>
                    <p className="text-sm text-gray-600 flex items-start gap-2 font-medium">
                      <MapPin size={14} className="text-gray-400 mt-1 shrink-0" /> {order.shippingAddress}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-50">
                  <h4 className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2 mb-4">
                    <CreditCard size={14} className="text-primary" /> Thanh toán
                  </h4>
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-700">
                      Phương thức: <span className="text-gray-900">{order.payment?.method === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Thanh toán khi nhận hàng (COD)'}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700">Trạng thái:</span>
                      {order.payment?.method === 'BANK_TRANSFER' ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className={cn(
                              "px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider border cursor-pointer hover:opacity-80 transition-all flex items-center gap-1",
                              order.payment?.status === 'SUCCESS' ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                              {order.payment?.status === 'SUCCESS' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                              <ChevronDown size={10} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48 rounded-2xl shadow-xl border-gray-100 p-2 bg-white" align="start">
                            <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-widest">Cập nhật thanh toán</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={order.payment?.status} onValueChange={handlePaymentStatusChange}>
                              <DropdownMenuRadioItem value="PENDING" className="cursor-pointer rounded-xl p-2 text-xs font-bold text-amber-600">Chưa thanh toán</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="SUCCESS" className="cursor-pointer rounded-xl p-2 text-xs font-bold text-green-600">Đã thanh toán</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider border",
                          order.payment?.status === 'SUCCESS' ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                          {order.payment?.status === 'SUCCESS' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      )}
                    </div>
                    {order.payment?.paidAt && (
                      <p className="text-[13px] font-medium text-gray-500 mt-2 italic">
                        Thời gian thanh toán: {format(new Date(order.payment.paidAt), "HH:mm:ss dd/MM/yyyy", { locale: vi })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2 mb-4">
                  <Package size={14} className="text-primary" /> Sản phẩm đã đặt
                </h4>
                <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left p-4 text-sm font-bold text-gray-700 ml-1">Sản phẩm</th>
                        <th className="text-center p-4 text-sm font-bold text-gray-700 ml-1">Số lượng</th>
                        <th className="text-right p-4 text-sm font-bold text-gray-700 ml-1">Đơn giá</th>
                        <th className="text-right p-4 text-sm font-bold text-gray-700 ml-1">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {order.items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-50">
                                {item.product?.mediaUrls?.[0] ? (
                                  <img src={getImageUrl(item.product.mediaUrls[0])} alt={item.product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Package size={16} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{item.product?.name || 'Sản phẩm đã xóa'}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Mã SP: #{item.productId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center font-bold text-gray-600">x{item.quantity}</td>
                          <td className="p-4 text-right font-bold text-gray-600">
                            {item.priceAtPurchase.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="p-4 text-right font-black text-gray-900">
                            {(item.priceAtPurchase * item.quantity).toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50/50 border-t border-gray-100 font-bold">
                      <tr>
                        <td colSpan={3} className="p-4 text-right text-gray-500">Tạm tính:</td>
                        <td className="p-4 text-right text-gray-900">{order.totalAmount.toLocaleString('vi-VN')} đ</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-4 text-right text-gray-500">Phí giao hàng:</td>
                        <td className="p-4 text-right text-gray-900">{order.shippingFee.toLocaleString('vi-VN')} đ</td>
                      </tr>
                      <tr className="text-lg">
                        <td colSpan={3} className="p-4 text-right text-primary">Tổng cộng:</td>
                        <td className="p-4 text-right text-primary font-black">{order.finalAmount.toLocaleString('vi-VN')} đ</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>

      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">Xác nhận hủy đơn hàng?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này sẽ hoàn lại số lượng tồn kho cho các sản phẩm trong đơn và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-full border-gray-200 cursor-pointer">Trở lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingStatus && executeStatusChange(pendingStatus)}
              className="rounded-full bg-red-500 hover:bg-red-600 text-white cursor-pointer border-none font-bold"
            >
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
