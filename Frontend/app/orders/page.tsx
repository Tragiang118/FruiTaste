'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, CheckCircle2, ChevronRight, PackageSearch, XCircle, Home, Store, Search, RotateCcw, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

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

interface Order {
  id: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  finalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);

  // Search & Date Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange(undefined);
  };

  const toggleExpand = (e: React.MouseEvent, orderId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'CONFIRMED': return 'Đã duyệt';
      case 'SHIPPING': return 'Đang giao hàng';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED': return <PackageSearch className="w-4 h-4 text-orange-500" />;
      case 'SHIPPING': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const tabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ xác nhận' },
    { key: 'SHIPPING', label: 'Đang giao' },
    { key: 'COMPLETED', label: 'Hoàn thành' },
    { key: 'CANCELLED', label: 'Đã hủy' },
  ] as const;

  const filteredOrders = orders.filter(o => {
    // 1) Tab filter
    if (activeTab !== 'ALL') {
      const tabMatch = activeTab === 'PENDING'
        ? (o.status === 'PENDING' || o.status === 'CONFIRMED')
        : o.status === activeTab;
      if (!tabMatch) return false;
    }

    // 2) Search term filter (search by order ID or product name)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchOrderId = String(o.id).includes(term) || `#${o.id}`.includes(term) || `đơn hàng #${o.id}`.toLowerCase().includes(term);
      const matchProduct = o.items.some(item =>
        item.product.name.toLowerCase().includes(term)
      );
      if (!matchOrderId && !matchProduct) return false;
    }

    // 3) Date range filter
    if (dateRange?.from || dateRange?.to) {
      const orderDate = new Date(o.createdAt);
      const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate()).getTime();

      if (dateRange.from) {
        const startOnly = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate()).getTime();
        if (orderDateOnly < startOnly) return false;
      }

      if (dateRange.to) {
        const endOnly = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate()).getTime();
        if (orderDateOnly > endOnly) return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between w-full mb-8 mt-4">
          <BackButton href="/" className="px-0 h-auto mb-0" />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1"><Home size={14} /> Trang chủ</Link>
            <ChevronRight size={14} />
            <span className="text-[#FF6B4A] font-medium truncate">Đơn hàng</span>
          </div>
        </div>
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900">Đơn Mua Của Tôi</h1>
          <p className="text-gray-500 text-sm">Theo dõi trạng thái và lịch sử mua hàng</p>
        </div>

        {/* Search & Date Filter controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn hàng hoặc tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-9 rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]/30 focus:border-[#FF6B4A] transition-all text-sm text-gray-900"
            />
          </div>

          {/* Date Picker Popover */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2 h-9 font-normal cursor-pointer shadow-none"
                >
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span>
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                      ) : (
                        `Từ ${format(dateRange.from, 'dd/MM/yyyy')}`
                      )
                    ) : (
                      "Lọc ngày"
                    )}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3 bg-white rounded-2xl border border-gray-100 shadow-xl" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={vi}
                  className="p-0 bg-transparent"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Tabs Shopee Style */}
        <div className="bg-white rounded-t-2xl shadow-sm border-b sticky top-0 z-10 flex overflow-x-auto custom-scrollbar no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[120px] py-4 px-2 text-center text-sm font-semibold transition-colors duration-200 border-b-2
                ${activeTab === tab.key ? 'text-primary border-primary bg-green-50/50' : 'text-gray-500 hover:text-gray-900 border-transparent bg-white'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Danh sách đơn hàng */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Đang lấy dữ liệu...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                <Store size={48} />
              </div>
              <p className="mt-4 text-gray-500 text-center">
                {searchTerm || dateRange?.from || dateRange?.to
                  ? "Không tìm thấy đơn hàng phù hợp với tiêu chí tìm kiếm."
                  : "Chưa có đơn hàng nào."}
              </p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <Card key={order.id} className="rounded-2xl border-0 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow group">
                {/* Header Đơn hàng */}
                <div className="border-b border-gray-100 p-4 bg-gray-50/50 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-primary" />
                    <span className="font-bold text-gray-900">FruiTaste Mall</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono font-medium">#{order.id}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wide">
                    {getStatusIcon(order.status)}
                    <span className={`
                       ${order.status === 'PENDING' || order.status === 'CONFIRMED' ? 'text-orange-500' : ''}
                       ${order.status === 'SHIPPING' ? 'text-blue-500' : ''}
                       ${order.status === 'COMPLETED' ? 'text-green-500' : ''}
                       ${order.status === 'CANCELLED' ? 'text-red-500' : ''}
                     `}>{getStatusText(order.status)}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-0 border-b border-gray-50 last:border-b-0">
                  <div className={cn(
                    "p-4 space-y-4 transition-all duration-300",
                    !expandedOrders.includes(order.id) && order.items.length > 1 ? "max-h-[120px] overflow-hidden" : "max-h-none"
                  )}>
                    {order.items.slice(0, expandedOrders.includes(order.id) ? order.items.length : 1).map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-start relative z-10 py-2 first:pt-0 last:pb-0">
                        <Link href={`/products/${item.product.id}`} className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 relative hover:ring-2 ring-primary/20 transition-all">
                          {item.product.mediaUrls?.[0] ? (
                            <img src={item.product.mediaUrls[0]} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply" />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </Link>
                        <div className="flex-1">
                          <Link href={`/products/${item.product.id}`} className="font-semibold text-gray-900 line-clamp-1 hover:text-primary transition-colors">{item.product.name}</Link>
                          <p className="text-gray-500 text-sm mt-1">x {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.priceAtPurchase)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.items.length > 1 && (
                    <div className={cn(
                      "flex items-center justify-center pb-4 pt-2 bg-white",
                      !expandedOrders.includes(order.id) ? "relative -mt-10 pt-12 bg-gradient-to-t from-white via-white/90 to-transparent" : ""
                    )}>
                      <button
                        onClick={(e) => toggleExpand(e, order.id)}
                        className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 hover:text-primary transition-colors cursor-pointer group"
                      >
                        {expandedOrders.includes(order.id) ? (
                          <>Thu gọn <ChevronRight className="w-3 h-3 rotate-[-90deg] group-hover:translate-y-[-2px] transition-transform" /></>
                        ) : (
                          <>Hiển thị thêm {order.items.length - 1} sản phẩm <ChevronRight className="w-3 h-3 rotate-90 group-hover:translate-y-[2px] transition-transform" /></>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer: Tổng tiền & Buttons */}
                <div className="border-t border-gray-100 bg-white p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-500">
                    Ngày đặt: {new Date((order as any).createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-gray-500 mr-2">Thành tiền:</span>
                      <span className="text-xl font-bold text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalAmount)}
                      </span>
                    </div>
                    <Link href={`/orders/${order.id}`}>
                      <Button className="rounded-full bg-primary hover:bg-green-600 font-bold px-6 shadow-sm text-white">Xem Chi Tiết</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}