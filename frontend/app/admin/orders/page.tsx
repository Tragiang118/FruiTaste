'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Filter, ArrowUpDown, ChevronDown, Calendar as CalendarIcon, ShoppingBag } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { vi } from "date-fns/locale/vi";
import OrderDetailsDialog from './OrderDetailsDialog';


interface Order {
  id: number;
  finalAmount: number;
  status: 'PENDING' | 'PREPARING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  shippingName?: string;
  shippingPhone?: string;
  user: {
    fullName: string;
    phone: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [filterDateType, setFilterDateType] = useState<string>("all");

  // Sort states
  const [dateSort, setDateSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');
  const [nameSort, setNameSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');
  const [totalSort, setTotalSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');
  
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.get('/orders/admin');
      setOrders(res.data);
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Chờ xác nhận', color: 'bg-blue-50/50 text-blue-400 border-blue-50', dot: 'bg-blue-400' };
      case 'CONFIRMED': return { label: 'Đã duyệt', color: 'bg-blue-50 text-blue-600 border-blue-100', dot: 'bg-blue-600' };
      case 'PREPARING': return { label: 'Đang chuẩn bị', color: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-600' };
      case 'SHIPPING': return { label: 'Đang giao', color: 'bg-purple-50 text-purple-600 border-purple-100', dot: 'bg-purple-600' };
      case 'COMPLETED': return { label: 'Hoàn thành', color: 'bg-green-50 text-green-600 border-green-100', dot: 'bg-green-600' };
      case 'CANCELLED': return { label: 'Đã hủy', color: 'bg-red-50 text-red-500 border-red-100', dot: 'bg-red-500' };
      default: return { label: status, color: 'bg-gray-50 text-gray-500 border-gray-100', dot: 'bg-gray-400' };
    }
  };

  const handleDateFilterChange = (value: string) => {
    setFilterDateType(value);
    const today = new Date();
    switch (value) {
      case "all": setDateRange({ from: undefined, to: undefined }); break;
      case "today": setDateRange({ from: today, to: today }); break;
      case "yesterday": const yesterday = subDays(today, 1); setDateRange({ from: yesterday, to: yesterday }); break;
      case "7d": setDateRange({ from: subDays(today, 6), to: today }); break;
      case "30d": setDateRange({ from: subDays(today, 29), to: today }); break;
      case "thisMonth": setDateRange({ from: startOfMonth(today), to: endOfMonth(today) }); break;
      case "custom": break;
    }
  };

  const getDateFilterLabel = (val: string) => {
    switch (val) {
      case "all": return "Tất cả thời gian";
      case "today": return "Hôm nay";
      case "yesterday": return "Hôm qua";
      case "7d": return "7 ngày qua";
      case "30d": return "30 ngày qua";
      case "thisMonth": return "Tháng này";
      default: return "Thời gian";
    }
  };


  // Filter and Sort logic
  let filteredOrders = orders.filter(order => {
    const matchSearch = 
      order.id.toString().includes(search) || 
      (order.user && order.user.fullName && order.user.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (order.user && order.user.phone && order.user.phone.includes(search));

    const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;

    let matchDate = true;
    if (dateRange.from && dateRange.to) {
      const orderDate = new Date(order.createdAt);
      const start = new Date(dateRange.from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange.to);
      end.setHours(23, 59, 59, 999);
      matchDate = orderDate >= start && orderDate <= end;
    }

    return matchSearch && matchStatus && matchDate;
  });

  if (dateSort !== 'NONE') {
    filteredOrders = [...filteredOrders].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return dateSort === 'ASC' ? diff : -diff;
    });
  } else if (nameSort !== 'NONE') {
    filteredOrders = [...filteredOrders].sort((a, b) => {
      const nameA = a.user?.fullName || '';
      const nameB = b.user?.fullName || '';
      return nameSort === 'ASC' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }

  return (
    <div className="p-6 md:p-8 space-y-6 w-full h-full overflow-y-auto bg-gray-50/30">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Quản lý Đơn hàng
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Theo dõi và cập nhật trạng thái đơn hàng.</p>
        </div>
        <Button onClick={() => fetchOrders()} variant="outline" className="bg-white rounded-full text-gray-700 cursor-pointer border-gray-200 h-8 px-4 text-xs font-bold shadow-none">
          <RefreshCw className={cn("mr-2 h-3.5 w-3.5 text-gray-500", loading && "animate-spin")} /> Làm mới
        </Button>
      </div>

      <Card className="rounded-3xl border-none shadow-sm overflow-hidden flex flex-col bg-white">
        <CardHeader className="border-b border-gray-50 p-6 space-y-4 bg-white">
           <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full xl:max-w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <Input 
                    placeholder="Tìm kiếm..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 rounded-full bg-gray-50/50 border-gray-200 h-8 text-[13px] shadow-none font-medium focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300 hover:border-gray-300 transition-colors"
                  />
                </div>

              {/* Advanced Filters */}
              <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-500 whitespace-nowrap">
                  <Filter size={16} /> Lọc theo:
                </div>

                {/* Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full border border-gray-200 font-bold text-gray-700 bg-gray-50/50 hover:bg-gray-100 min-w-[140px] justify-between h-8 px-3 text-[13px] shadow-none transition-colors">
                      {statusFilter === 'ALL' ? 'Tất cả trạng thái' : getStatusInfo(statusFilter).label}
                      <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-40 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border border-gray-100 p-2 bg-white" align="start">
                    <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-widest">CHỌN TRẠNG THÁI LỌC</DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1 bg-gray-50" />
                    <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                      <DropdownMenuRadioItem value="ALL" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Tất cả trạng thái</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="PENDING" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-blue-400">Chờ xác nhận</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="CONFIRMED" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-blue-600">Đã duyệt</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="PREPARING" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-amber-600">Đang chuẩn bị</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="SHIPPING" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-purple-600">Đang giao</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="COMPLETED" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-green-600">Hoàn thành</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="CANCELLED" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-red-500">Đã hủy</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Quick Date Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full border border-gray-200 font-bold text-gray-700 bg-gray-50/50 hover:bg-gray-100 h-8 px-3 text-[13px] gap-2 transition-colors">
                      {getDateFilterLabel(filterDateType)}
                      <ChevronDown size={12} className="opacity-40" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-gray-100 p-2 bg-white" align="start">
                    <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-widest">KHOẢNG THỜI GIAN</DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1 bg-gray-50" />
                    <DropdownMenuRadioGroup value={filterDateType} onValueChange={handleDateFilterChange}>
                      <DropdownMenuRadioItem value="all" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Tất cả thời gian</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="today" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Hôm nay</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="yesterday" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Hôm qua</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="7d" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-primary">7 ngày qua</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="30d" className="cursor-pointer rounded-xl font-bold p-2 text-xs">30 ngày qua</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="thisMonth" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Tháng này</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* New Calendar Date Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "rounded-full border border-gray-200 font-bold text-gray-700 bg-gray-50/50 hover:bg-gray-100 h-8 px-3 text-[13px] transition-colors"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary/70" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM")} - {format(dateRange.to, "dd/MM")}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy")
                        )
                      ) : (
                        <span>Lọc ngày</span>
                      )}
                      <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-40" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-[2rem] shadow-2xl border-gray-100 bg-white" align="end">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range: any) => {
                        setDateRange(range || { from: undefined, to: undefined });
                        if (range?.from && range?.to) setFilterDateType("custom");
                      }}
                      numberOfMonths={2}
                      locale={vi}
                    />
                  </PopoverContent>
                </Popover>
              </div>
           </div>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 overflow-x-auto">
          {loading ? (
             <div className="flex flex-col justify-center items-center h-60 gap-3 text-gray-400">
                <RefreshCw className="animate-spin w-8 h-8 text-primary" />
                <p className="text-sm font-medium">Đang tải dữ liệu đơn hàng...</p>
             </div>
          ) : (
             <Table>
               <TableHeader className="bg-gray-50/50">
                 <TableRow className="border-gray-50">
                   <TableHead className="w-16 text-center font-bold text-gray-700">ID</TableHead>
                   <TableHead className="font-bold text-gray-700 min-w-[200px]">
                     <div className="flex items-center gap-1">
                       Người nhận
                       <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={() => {
                         setNameSort(nameSort === 'ASC' ? 'DESC' : nameSort === 'DESC' ? 'NONE' : 'ASC');
                         setDateSort('NONE');
                       }}>
                         <ArrowUpDown className={cn("w-3 h-3", nameSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                       </Button>
                     </div>
                   </TableHead>
                   <TableHead className="font-bold text-gray-700">Số điện thoại</TableHead>
                   <TableHead className="font-bold text-gray-700 min-w-[200px]">
                     <div className="flex items-center gap-1">
                       Tổng tiền
                       <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={() => {
                         setTotalSort(totalSort === 'ASC' ? 'DESC' : totalSort === 'DESC' ? 'NONE' : 'ASC');
                         setDateSort('NONE');
                       }}>
                         <ArrowUpDown className={cn("w-3 h-3", totalSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                       </Button>
                     </div>
                   </TableHead>
                   <TableHead className="font-bold text-gray-700 text-center">Trạng thái</TableHead>
                   <TableHead className="font-bold text-gray-700">
                     <div className="flex items-center gap-1">
                       Ngày đặt
                       <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={() => {
                         setDateSort(dateSort === 'ASC' ? 'DESC' : dateSort === 'DESC' ? 'NONE' : 'ASC');
                         setNameSort('NONE');
                       }}>
                         <ArrowUpDown className={cn("w-3 h-3", dateSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                       </Button>
                     </div>
                   </TableHead>
                   <TableHead className="w-20 text-center font-bold text-gray-700">Xem</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-40 text-center text-gray-400 font-medium text-sm">
                        Không tìm thấy đơn hàng nào
                      </TableCell>
                    </TableRow>
                 ) : filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                      <TableRow key={order.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors group">
                        <TableCell className="text-center font-bold text-gray-400 py-3 text-[13px]">#{order.id}</TableCell>
                        <TableCell>
                          <span className="font-bold text-gray-900 group-hover:text-primary transition-colors text-[13px]">{order.shippingName || order.user?.fullName || 'Khách hàng'}</span>
                        </TableCell>
                        <TableCell className="text-gray-600 font-medium text-[13px]">{order.shippingPhone || order.user?.phone || '---'}</TableCell>
                        <TableCell className="font-black text-gray-900 text-[13px]">
                          {(order.finalAmount || 0).toLocaleString('vi-VN')} đ
                        </TableCell>
                        <TableCell className="text-center">
                           <span className={cn(
                            "inline-flex justify-center items-center px-3 py-1 rounded-full text-[11px] font-bold w-[120px] border",
                            statusInfo.color
                          )}>
                            {updatingId === order.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-gray-400" />
                            ) : (
                              <>
                                <span className={cn("w-1.5 h-1.5 rounded-full mr-2", statusInfo.dot)} />
                                <span className="flex-1 text-center">{statusInfo.label}</span>
                              </>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-500 font-bold text-[11px]">
                          {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="text-center">
                          <OrderDetailsDialog orderId={order.id} onUpdate={fetchOrders} />
                        </TableCell>
                      </TableRow>
                    );
                 })}
               </TableBody>
             </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}