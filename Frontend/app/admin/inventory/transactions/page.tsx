'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/axios';
import { 
  History, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Clock, 
  Calendar as CalendarIcon, 
  Filter, 
  Package, 
  FileText, 
  AlertCircle, 
  ArrowUpDown, 
  Eye, 
  ChevronDown, 
  ExternalLink, 
  ChevronRight 
} from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Transaction {
  id: number;
  productId: number;
  type: 'IMPORT' | 'EXPORT' | 'ADJUST' | 'RETURN';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  referenceId: string | null;
  createdAt: string;
  product: {
    name: string;
    unit: string;
  };
  transactionReason?: string | null;
  staffName?: string | null;
}

export default function InventoryTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Filtering states
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [filterDateType, setFilterDateType] = useState<string>("all");

  // Sorting states
  const [timeSort, setTimeSort] = useState<'ASC' | 'DESC' | 'NONE'>('DESC');
  const [productSort, setProductSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');
  const [beforeSort, setBeforeSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');
  const [afterSort, setAfterSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');

  // Detail Modal state
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory/transactions');
      setTransactions(res.data);
    } catch (error) {
      console.error('Lỗi khi tải giao dịch kho:', error);
      toast.error('Không thể tải lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
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

  const filteredTransactions = transactions.filter(t => {
    const matchSearch = t.product.name.toLowerCase().includes(search.toLowerCase()) ||
                       t.reason?.toLowerCase().includes(search.toLowerCase()) ||
                       t.id.toString() === search ||
                       t.referenceId?.toString() === search;
    
    const matchType = typeFilter === 'ALL' || t.type === typeFilter;
    
    let matchDate = true;
    if (date?.from) {
      const targetDate = new Date(t.createdAt);
      const from = startOfDay(date.from);
      const to = date.to ? endOfDay(date.to) : endOfDay(date.from);
      matchDate = isWithinInterval(targetDate, { start: from, end: to });
    }

    return matchSearch && matchType && matchDate;
  });

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (timeSort !== 'NONE') {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return timeSort === 'ASC' ? aTime - bTime : bTime - aTime;
      }
      if (productSort !== 'NONE') {
        const cmp = a.product.name.localeCompare(b.product.name);
        return productSort === 'ASC' ? cmp : -cmp;
      }
      if (beforeSort !== 'NONE') {
        return beforeSort === 'ASC' ? a.previousStock - b.previousStock : b.previousStock - a.previousStock;
      }
      if (afterSort !== 'NONE') {
        return afterSort === 'ASC' ? a.newStock - b.newStock : b.newStock - a.newStock;
      }
      // Mặc định sắp xếp theo thời gian mới nhất
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredTransactions, timeSort, productSort, beforeSort, afterSort]);

  const getTransactionTypeInfo = (type: string, quantity?: number) => {
    switch (type) {
      case 'IMPORT': return { label: 'Nhập kho', color: 'bg-green-50 text-green-600 border-green-100', icon: <ArrowDownRight size={12} className="rotate-90" /> };
      case 'EXPORT': return { label: 'Xuất kho', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: <ArrowUpRight size={12} /> };
      case 'ADJUST': 
        if (quantity === undefined) return { label: 'Điều chỉnh', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: <RefreshCw size={12} /> };
        if (quantity > 0) return { label: 'Nhập kho', color: 'bg-green-50 text-green-600 border-green-100', icon: <ArrowDownRight size={12} className="rotate-90" /> };
        return { label: 'Xuất kho', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: <ArrowUpRight size={12} /> };
      case 'RETURN': return { label: 'Hoàn trả', color: 'bg-purple-50 text-purple-600 border-purple-100', icon: <History size={12} /> };
      default: return { label: type, color: 'bg-gray-50 text-gray-600 border-gray-100', icon: null };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-primary" />
              Lịch sử kho
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Chi tiết các biến động nhập và xuất tồn kho.</p>
          </div>
        </div>
        <Button 
          variant="outline" onClick={fetchTransactions}
          className="bg-white rounded-full text-gray-700 cursor-pointer border-gray-200 h-8 px-4 text-xs font-bold shadow-none transition-all hover:bg-gray-50"
        >
          <RefreshCw size={14} className={cn("mr-2 text-gray-500", loading && "animate-spin")} />
          Làm mới
        </Button>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 p-6">
          <div className="flex items-center gap-4 justify-between w-full">
            {/* Left side: Search Bar */}
            <div className="relative w-full max-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <Input 
                placeholder="Tìm kiếm..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-full bg-gray-50/50 border-gray-200 h-8 text-[13px] shadow-none font-medium focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300 hover:border-gray-300 transition-colors"
              />
            </div>
            
            {/* Right side: All Filters in one row */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
               <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase tracking-widest mr-1 shrink-0">
                  <Filter size={14} /> Lọc theo:
               </div>

               {/* Type Filter */}
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full border border-gray-200 font-bold text-gray-700 bg-gray-50/50 hover:bg-gray-100 h-8 px-3 text-[12px] gap-2 transition-colors shadow-none shrink-0">
                      {typeFilter === 'ALL' ? 'Tất cả phân loại' : getTransactionTypeInfo(typeFilter, undefined).label}
                      <ChevronDown size={14} className="opacity-40" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-gray-100 p-2 bg-white" align="end">
                    <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-widest">PHÂN LOẠI</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                      <DropdownMenuRadioItem value="ALL" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Tất cả giao dịch</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="IMPORT" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-green-600">Nhập kho</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="EXPORT" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-blue-600">Xuất kho</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="RETURN" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-purple-600">Hoàn trả</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
               </DropdownMenu>

               {/* Time Preset Filter */}
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full border border-gray-200 font-bold text-gray-700 bg-gray-50/50 hover:bg-gray-100 h-8 px-3 text-[12px] gap-2 transition-colors shadow-none shrink-0">
                      {getDateFilterLabel(filterDateType)}
                      <ChevronDown size={14} className="opacity-40" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-gray-100 p-2 bg-white" align="end">
                    <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-widest">KHOẢNG THỜI GIAN</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={filterDateType} onValueChange={handleDateFilterChange}>
                      <DropdownMenuRadioItem value="all" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Tất cả thời gian</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="today" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-primary">Hôm nay</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="yesterday" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Hôm qua</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="7d" className="cursor-pointer rounded-xl font-bold p-2 text-xs">7 ngày qua</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="30d" className="cursor-pointer rounded-xl font-bold p-2 text-xs">30 ngày qua</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="thisMonth" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Tháng này</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
               </DropdownMenu>

               {/* Custom Date Picker */}
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
                    <Calendar
                      mode="range" selected={date}
                      onSelect={(range) => { setDate(range); if (range?.from && range?.to) setFilterDateType("custom"); }}
                      numberOfMonths={2} locale={vi}
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
                  <TableHead className="w-40 font-bold text-gray-700 pl-8">
                    <div className="flex items-center gap-1">
                       Thời gian
                       <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => {
                         setTimeSort(timeSort === 'ASC' ? 'DESC' : timeSort === 'DESC' ? 'NONE' : 'ASC');
                         setProductSort('NONE'); setBeforeSort('NONE'); setAfterSort('NONE');
                       }}>
                         <ArrowUpDown className={cn("w-3.5 h-3.5", timeSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                       </Button>
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    <div className="flex items-center gap-1">
                       Sản phẩm
                       <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => {
                         setProductSort(productSort === 'ASC' ? 'DESC' : productSort === 'DESC' ? 'NONE' : 'ASC');
                         setTimeSort('NONE'); setBeforeSort('NONE'); setAfterSort('NONE');
                       }}>
                         <ArrowUpDown className={cn("w-3.5 h-3.5", productSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                       </Button>
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Loại</TableHead>
                  <TableHead className="text-right font-bold text-gray-700">Biến động</TableHead>
                  <TableHead className="text-right font-bold text-gray-700">
                    <div className="flex items-center justify-end gap-1">
                       Trước
                       <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => {
                         setBeforeSort(beforeSort === 'ASC' ? 'DESC' : beforeSort === 'DESC' ? 'NONE' : 'ASC');
                         setTimeSort('NONE'); setProductSort('NONE'); setAfterSort('NONE');
                       }}>
                         <ArrowUpDown className={cn("w-3.5 h-3.5", beforeSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                       </Button>
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-700">
                    <div className="flex items-center justify-end gap-1">
                       Sau
                       <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => {
                         setAfterSort(afterSort === 'ASC' ? 'DESC' : afterSort === 'DESC' ? 'NONE' : 'ASC');
                         setTimeSort('NONE'); setProductSort('NONE'); setBeforeSort('NONE');
                       }}>
                         <ArrowUpDown className={cn("w-3.5 h-3.5", afterSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                       </Button>
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[200px] font-bold text-gray-700 pl-10">Lý do / Tham chiếu</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse border-gray-50">
                      <TableCell colSpan={8} className="py-8"><div className="h-6 bg-gray-100 rounded-lg w-full"></div></TableCell>
                    </TableRow>
                  ))
                ) : sortedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center">
                       <div className="flex flex-col items-center justify-center gap-3">
                          <History className="w-12 h-12 text-gray-100" />
                          <p className="text-gray-400 font-bold">Chưa có giao dịch kho nào được ghi nhận.</p>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : sortedTransactions.map((t) => {
                  const typeInfo = getTransactionTypeInfo(t.type, t.quantity);
                  return (
                    <TableRow key={t.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors group">
                      <TableCell className="pl-8">
                        <div className="flex flex-col">
                           <span className="text-[13px] font-black text-gray-800">{new Date(t.createdAt).toLocaleDateString('vi-VN')}</span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(t.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary/20" />
                            <span className="font-bold text-gray-900 text-[14px]">{t.product.name}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-center">
                         <span className={cn(
                           "px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter inline-flex items-center gap-1",
                           typeInfo.color
                         )}>
                            {typeInfo.icon}
                            {typeInfo.label}
                         </span>
                      </TableCell>
                      <TableCell className="text-right">
                         <span className={cn(
                           "text-[15px] font-black",
                           t.quantity > 0 ? "text-green-600" : "text-red-500"
                         )}>
                            {t.quantity > 0 ? `+${t.quantity}` : t.quantity}
                         </span>
                         <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">{t.product.unit}</span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-gray-400 text-[13px]">
                        {t.previousStock}
                      </TableCell>
                      <TableCell className="text-right font-black text-gray-900 text-[14px]">
                        {t.newStock}
                      </TableCell>
                      <TableCell className="pl-10">
                        <div className="flex flex-col">
                           <p className="text-[13px] font-bold text-gray-700 line-clamp-1">{t.reason || 'Không có lý do'}</p>
                           {t.referenceId && (
                             <span className="text-[10px] font-bold text-primary uppercase flex items-center gap-1 mt-0.5">
                                <FileText size={10} /> Tham chiếu: #{t.referenceId}
                             </span>
                           )}
                        </div>
                      </TableCell>
                      <TableCell>
                         <Button 
                           variant="ghost" size="icon" 
                           onClick={() => { setSelectedTransaction(t); setIsDetailOpen(true); }}
                           className="h-8 w-8 text-gray-300 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                         >
                            <Eye size={16} />
                         </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog - Compact & Centered */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-[400px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white outline-none [&>button]:right-6 [&>button]:top-7 [&>button]:rounded-full [&>button]:bg-gray-100 [&>button]:text-gray-500 [&>button]:border-none [&>button]:hover:bg-gray-200 [&>button]:transition-all [&>button]:w-8 [&>button]:h-8 [&>button]:flex [&>button]:items-center [&>button]:justify-center">
           {/* Header - Compact */}
           <div className="p-6 bg-white border-b border-gray-100 relative">
              <div className="flex items-center gap-3 mb-4 pr-12">
                 <div className={cn(
                   "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/10",
                   selectedTransaction && getTransactionTypeInfo(selectedTransaction.type, selectedTransaction.quantity).color.replace('bg-', 'bg-white/').replace('text-', 'text-gray-600')
                 )}>
                     {selectedTransaction && getTransactionTypeInfo(selectedTransaction.type, selectedTransaction.quantity).icon}
                     <span className="text-gray-600">{selectedTransaction && getTransactionTypeInfo(selectedTransaction.type, selectedTransaction.quantity).label}</span>
                 </div>
                 <span className="text-gray-300 font-bold text-[10px]">#{selectedTransaction?.id}</span>
              </div>
              
              <DialogTitle className="text-sm font-bold text-gray-700 ml-1 leading-tight">
                {selectedTransaction?.product.name}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-[11px] font-medium mt-1 flex items-center gap-1.5">
                 <Clock size={10} />
                 {selectedTransaction && format(new Date(selectedTransaction.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
              </DialogDescription>
           </div>

           {/* Content - Compressed */}
           <div className="p-6 space-y-5">
              {/* Stats - Horizontal Compact */}
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-sm font-bold text-gray-700 ml-1 mb-1">Tồn trước</p>
                    <p className="text-lg font-black text-gray-700">{selectedTransaction?.previousStock} <span className="text-[9px] opacity-40 uppercase">{selectedTransaction?.product.unit}</span></p>
                 </div>
                 <div className={cn(
                   "p-3.5 rounded-2xl border",
                   selectedTransaction && selectedTransaction.quantity > 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
                 )}>
                    <p className="text-sm font-bold text-gray-700 ml-1 mb-1">Biến động</p>
                    <p className={cn("text-lg font-black", selectedTransaction && selectedTransaction.quantity > 0 ? "text-green-600" : "text-red-500")}>
                       {selectedTransaction && selectedTransaction.quantity > 0 ? `+${selectedTransaction.quantity}` : selectedTransaction?.quantity}
                       <span className="text-[9px] opacity-40 uppercase ml-0.5">{selectedTransaction?.product.unit}</span>
                    </p>
                 </div>
              </div>

              {/* Result Card - Slim */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between px-6">
                 <span className="text-sm font-bold text-gray-700 ml-1">Tồn sau</span>
                 <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-primary">{selectedTransaction?.newStock}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{selectedTransaction?.product.unit}</span>
                 </div>
              </div>

              {/* Reason & Staff - Compact Box */}
              <div className="space-y-3">
                 <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-3">
                    {selectedTransaction?.transactionReason && (
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lý do</span>
                          <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg uppercase">
                             {selectedTransaction.transactionReason === 'damaged' ? 'Hỏng hóc / Dập nát' : 
                              selectedTransaction.transactionReason === 'internal' ? 'Tiêu dùng nội bộ' : 'Khác'}
                          </span>
                       </div>
                    )}
                    
                    {selectedTransaction?.staffName && (
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Người xác nhận</span>
                          <span className="text-[11px] font-black text-gray-700">{selectedTransaction.staffName}</span>
                       </div>
                    )}

                    <div className="space-y-1.5">
                       <div className="flex items-center gap-1.5">
                          <FileText size={10} className="text-gray-400" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ghi chú</span>
                       </div>
                       <p className="text-[12px] font-bold text-gray-600 italic leading-snug">
                          "{selectedTransaction?.reason || 'Không có ghi chú.'}"
                       </p>
                    </div>

                    {selectedTransaction?.referenceId && (
                       <div className="pt-2 border-t border-gray-200/30 flex justify-between items-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tham chiếu</span>
                          <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">#{selectedTransaction.referenceId}</span>
                       </div>
                    )}
                 </div>
              </div>

              {/* Action - Slim Button */}
              {selectedTransaction?.referenceId && (
                 <Button 
                   variant="outline" 
                   onClick={() => {
                     if (selectedTransaction.type === 'IMPORT') router.push(`/admin/inventory/import/${selectedTransaction.referenceId}`);
                     else if (selectedTransaction.type === 'EXPORT') router.push(`/admin/orders/${selectedTransaction.referenceId}`);
                   }}
                   className="w-full rounded-xl h-10 border-primary/20 text-primary font-black text-[11px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all gap-2"
                 >
                    <ExternalLink size={12} />
                    Xem chứng từ
                 </Button>
              )}
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
