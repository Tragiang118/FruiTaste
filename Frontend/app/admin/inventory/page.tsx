'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { 
  Warehouse, 
  Search, 
  ArrowUpDown, 
  Plus, 
  Minus,
  History, 
  AlertTriangle, 
  Filter, 
  ChevronDown,
  RefreshCw,
  Calendar as CalendarIcon,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InventoryItem {
  productId: number;
  currentStock: number;
  lowStockThreshold: number;
  lastImportDate: string | null;
  lastExportDate: string | null;
  product: {
    name: string;
    unit: string;
    price: number;
  };
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL, HIGH, LOW, OUT

  // Date filtering states
  const [dateType, setDateType] = useState<'import' | 'export'>('export');
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [filterDateType, setFilterDateType] = useState<string>("all");

  // Sorting states
  const [productSort, setProductSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');
  const [stockSort, setStockSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');
  const [lastImportSort, setLastImportSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');
  const [lastExportSort, setLastExportSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory');
      setInventory(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách tồn kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDateFilterChange = (value: string) => {
    setFilterDateType(value);
    const today = new Date();
    switch (value) {
      case "all": setDate(undefined); break;
      case "today": setDate({ from: today, to: today }); break;
      case "yesterday": const yesterday = subDays(today, 1); setDate({ from: yesterday, to: yesterday }); break;
      case "7d": setDate({ from: subDays(today, 6), to: today }); break;
      case "30d": setDate({ from: subDays(today, 29), to: today }); break;
      case "thisMonth": setDate({ from: startOfMonth(today), to: endOfMonth(today) }); break;
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
      case "custom": return "Tùy chọn...";
      default: return "Thời gian";
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchSearch = item.product.name.toLowerCase().includes(search.toLowerCase()) || 
                       item.productId.toString() === search;
    
    if (stockFilter === 'HIGH') return matchSearch && item.currentStock > item.lowStockThreshold;
    if (stockFilter === 'LOW') return matchSearch && item.currentStock <= item.lowStockThreshold && item.currentStock > 0;
    if (stockFilter === 'OUT') return matchSearch && item.currentStock <= 0;
    
    // Check Date Filter
    let matchDate = true;
    if (date?.from) {
      const targetDateStr = dateType === 'import' ? item.lastImportDate : item.lastExportDate;
      if (!targetDateStr) {
        matchDate = false;
      } else {
        const targetDate = new Date(targetDateStr);
        const from = startOfDay(date.from);
        const to = date.to ? endOfDay(date.to) : endOfDay(date.from);
        matchDate = isWithinInterval(targetDate, { start: from, end: to });
      }
    }

    return matchSearch && matchDate;
  });

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (productSort !== 'NONE') {
      const cmp = a.product.name.localeCompare(b.product.name);
      return productSort === 'ASC' ? cmp : -cmp;
    }
    if (stockSort !== 'NONE') {
      return stockSort === 'ASC' ? a.currentStock - b.currentStock : b.currentStock - a.currentStock;
    }
    if (lastImportSort !== 'NONE') {
      const aTime = a.lastImportDate ? new Date(a.lastImportDate).getTime() : 0;
      const bTime = b.lastImportDate ? new Date(b.lastImportDate).getTime() : 0;
      return lastImportSort === 'ASC' ? aTime - bTime : bTime - aTime;
    }
    if (lastExportSort !== 'NONE') {
      const aTime = a.lastExportDate ? new Date(a.lastExportDate).getTime() : 0;
      const bTime = b.lastExportDate ? new Date(b.lastExportDate).getTime() : 0;
      return lastExportSort === 'ASC' ? aTime - bTime : bTime - aTime;
    }
    return 0;
  });

  const lowStockCount = inventory.filter(i => i.currentStock <= i.lowStockThreshold && i.currentStock > 0).length;
  const outOfStockCount = inventory.filter(i => i.currentStock <= 0).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-primary" />
            Quản lý kho
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Theo dõi số lượng, cảnh báo hàng sắp hết và quản lý nhập xuất.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchInventory} variant="outline" className="bg-white rounded-full text-gray-700 cursor-pointer border-gray-200 h-8 px-4 text-xs font-bold shadow-none">
            <RefreshCw className={`mr-2 h-3.5 w-3.5 text-gray-500 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </Button>
          <Link href="/admin/inventory/transactions">
             <Button variant="outline" className="rounded-full border-gray-200 font-bold gap-2 bg-white shadow-sm hover:bg-gray-50 h-8 px-4 transition-all text-xs">
                <History size={14} className="text-gray-500" />
                Lịch sử kho
             </Button>
           </Link>
           <Link href="/admin/inventory/create">
            <Button className="bg-primary text-white rounded-full px-5 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer h-8 font-bold text-xs gap-2">
              <PlusCircle className="h-3.5 w-3.5" />
              Tạo phiếu xuất/nhập kho
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                <Package size={24} />
              </div>
              <span className="text-[10px] font-black text-blue-400 bg-blue-50 px-2 py-1 rounded-lg uppercase">Tổng sản phẩm</span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-gray-900 leading-none">{inventory.length}</h3>
              <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-tighter">Sản phẩm trong danh mục</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                <AlertTriangle size={24} />
              </div>
              <span className="text-[10px] font-black text-amber-400 bg-amber-50 px-2 py-1 rounded-lg uppercase">Sắp hết hàng</span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-gray-900 leading-none">{lowStockCount}</h3>
              <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-tighter">Dưới ngưỡng tối thiểu</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:scale-110 transition-transform">
                <AlertTriangle size={24} />
              </div>
              <span className="text-[10px] font-black text-red-400 bg-red-50 px-2 py-1 rounded-lg uppercase">Hết hàng</span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-gray-900 leading-none">{outOfStockCount}</h3>
              <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-tighter">Số lượng bằng 0</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600 group-hover:scale-110 transition-transform">
                <RefreshCw size={24} />
              </div>
              <span className="text-[10px] font-black text-green-400 bg-green-50 px-2 py-1 rounded-lg uppercase">Tình trạng chung</span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-gray-900 leading-none">
                {inventory.length > 0 ? Math.round(((inventory.length - outOfStockCount) / inventory.length) * 100) : 0}%
              </h3>
              <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-tighter">Tỷ lệ có hàng</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 p-8 space-y-6">
          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full xl:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <Input 
                placeholder="Tìm kiếm theo tên hoặc mã..." 
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
               
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className="rounded-full border border-gray-200 font-bold text-gray-700 bg-gray-50/50 hover:bg-gray-100 min-w-[140px] justify-between h-8 px-3 text-[13px] shadow-none transition-colors">
                     {stockFilter === 'ALL' ? 'Tất cả trạng thái' : stockFilter === 'HIGH' ? "Còn hàng" : stockFilter === 'LOW' ? 'Sắp hết hàng' : 'Đã hết hàng'}
                     <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-40 shrink-0" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-gray-100 p-2 bg-white">
                    <DropdownMenuLabel className="text-sm font-bold text-gray-700 ml-1">Chọn trạng thái kho</DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1 bg-gray-50" />
                    <DropdownMenuRadioGroup value={stockFilter} onValueChange={setStockFilter}>
                       <DropdownMenuRadioItem value="ALL" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Tất cả sản phẩm</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="HIGH" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-green-600">Còn hàng</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="LOW" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-amber-600">Sắp hết hàng</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="OUT" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-red-500">Đã hết hàng</DropdownMenuRadioItem>
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
                  <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-gray-100 p-2 bg-white" align="end">
                    <DropdownMenuLabel className="text-sm font-bold text-gray-700 ml-1">Khoảng thời gian</DropdownMenuLabel>
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

                {/* Date Picker Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "rounded-full border border-gray-200 font-bold text-gray-700 bg-gray-50/50 hover:bg-gray-100 h-8 px-3 text-[13px] transition-colors"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary/70" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "dd/MM")} - {format(date.to, "dd/MM")}
                          </>
                        ) : (
                          format(date.from, "dd/MM/yyyy")
                        )
                      ) : (
                        <span>Lọc ngày</span>
                      )}
                      <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-40" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4 rounded-[2rem] shadow-2xl border-gray-100 bg-white" align="end">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <span className="text-sm font-bold text-gray-600">Lọc theo:</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="h-8 rounded-full text-xs font-bold px-3">
                            {dateType === 'export' ? 'Ngày xuất kho' : 'Ngày nhập kho'}
                            <ChevronDown className="ml-2 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-xl shadow-lg border-gray-100 p-2 bg-white">
                          <DropdownMenuRadioGroup value={dateType} onValueChange={(v) => setDateType(v as 'export' | 'import')}>
                            <DropdownMenuRadioItem value="export" className="cursor-pointer rounded-lg font-bold p-2 text-xs">Ngày xuất kho</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="import" className="cursor-pointer rounded-lg font-bold p-2 text-xs">Ngày nhập kho</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Calendar
                      mode="range"
                      selected={date}
                      onSelect={(range) => {
                        setDate(range);
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

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-gray-50">
                  <TableHead className="w-16 text-center font-bold text-gray-700">ID</TableHead>
                  <TableHead className="min-w-[200px] font-bold text-gray-700">
                    <div className="flex items-center gap-1">
                      Sản phẩm
                      <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => {
                        setProductSort(productSort === 'ASC' ? 'DESC' : productSort === 'DESC' ? 'NONE' : 'ASC');
                        setStockSort('NONE'); setLastImportSort('NONE'); setLastExportSort('NONE');
                      }}>
                        <ArrowUpDown className={cn("w-3.5 h-3.5", productSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-700">
                    <div className="flex items-center justify-center gap-1">
                      Tồn kho hiện tại
                      <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => {
                        setStockSort(stockSort === 'ASC' ? 'DESC' : stockSort === 'DESC' ? 'NONE' : 'ASC');
                        setProductSort('NONE'); setLastImportSort('NONE'); setLastExportSort('NONE');
                      }}>
                        <ArrowUpDown className={cn("w-3.5 h-3.5", stockSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Ngưỡng tối thiểu</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Đơn vị</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">
                    <div className="flex items-center justify-center gap-1">
                      Lần nhập cuối
                      <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => {
                        setLastImportSort(lastImportSort === 'ASC' ? 'DESC' : lastImportSort === 'DESC' ? 'NONE' : 'ASC');
                        setProductSort('NONE'); setStockSort('NONE'); setLastExportSort('NONE');
                      }}>
                        <ArrowUpDown className={cn("w-3.5 h-3.5", lastImportSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-700">
                    <div className="flex items-center justify-center gap-1">
                      Lần xuất cuối
                      <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => {
                        setLastExportSort(lastExportSort === 'ASC' ? 'DESC' : lastExportSort === 'DESC' ? 'NONE' : 'ASC');
                        setProductSort('NONE'); setStockSort('NONE'); setLastImportSort('NONE');
                      }}>
                        <ArrowUpDown className={cn("w-3.5 h-3.5", lastExportSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-32 font-bold text-gray-700 text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse border-gray-50">
                      <TableCell colSpan={8} className="py-8">
                        <div className="h-6 bg-gray-100 rounded-lg w-full"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : sortedInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                            <Warehouse className="w-8 h-8 text-gray-200" />
                         </div>
                         <p className="text-gray-400 font-bold">Không tìm thấy dữ liệu tồn kho nào.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedInventory.map((item) => (
                  <TableRow key={item.productId} className="border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <TableCell className="text-center font-bold text-gray-400 py-4 text-[13px]">
                      #{item.productId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-primary transition-colors text-[14px]">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                          {item.product.price.toLocaleString('vi-VN')} đ / {item.product.unit}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[13px] font-black border flex items-center gap-1.5 min-w-[70px] justify-center",
                          item.currentStock <= 0 
                            ? "bg-red-50 text-red-500 border-red-100 shadow-sm shadow-red-100" 
                            : item.currentStock <= item.lowStockThreshold
                              ? "bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-100"
                              : "bg-green-50 text-green-600 border-green-100 shadow-sm shadow-green-100"
                        )}>
                          {item.currentStock}
                          {item.currentStock <= item.lowStockThreshold && (
                            <AlertTriangle size={12} className={item.currentStock <= 0 ? 'text-red-500' : 'text-amber-500'} />
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-gray-500 text-[13px]">
                      {item.lowStockThreshold}
                    </TableCell>
                    <TableCell className="text-center font-bold text-gray-400 text-[12px] uppercase">
                      {item.product.unit}
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex flex-col items-center">
                          <span className="text-[13px] font-bold text-gray-600">
                             {item.lastImportDate ? new Date(item.lastImportDate).toLocaleDateString('vi-VN') : '--'}
                          </span>
                          {item.lastImportDate && (
                            <span className="text-[10px] text-green-500 font-bold flex items-center gap-0.5">
                               <Plus size={10} /> Nhập
                            </span>
                          )}
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex flex-col items-center">
                          <span className="text-[13px] font-bold text-gray-600">
                             {item.lastExportDate ? new Date(item.lastExportDate).toLocaleDateString('vi-VN') : '--'}
                          </span>
                          {item.lastExportDate && (
                            <span className="text-[10px] text-blue-500 font-bold flex items-center gap-0.5">
                               <ArrowUpRight size={10} /> Xuất
                            </span>
                          )}
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/admin/inventory/create?productId=${item.productId}`}>
                          <Button variant="ghost" size="icon" title="Nhập kho" className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
                             <Plus size={16} />
                          </Button>
                        </Link>
                        <Link href={`/admin/inventory/create?type=export&productId=${item.productId}`}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Xuất kho" 
                            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all cursor-pointer" 
                          >
                             <Minus size={16} />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
