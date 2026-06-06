'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import {
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  RefreshCw,
  Calendar as CalendarIcon,
  ChevronDown,
  Filter,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
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
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { vi } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import BarSimple from "@/components/charts/bar-simple";
import PieDonutText from "@/components/charts/pie-donut-text";

interface YearlyData {
  month: string;
  revenue: number;
}

interface StatsData {
  overview: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalUsers: number;
    totalRevenue: number;
  };
  revenueByDay: { date: string; revenue: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  unsoldProducts: { id: number; name: string; price: number; stockQuantity: number; unit: string }[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminStatisticsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });
  const [filterType, setFilterType] = useState<string>("7d");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (date?.from && date?.to) {
        params.startDate = format(date.from, "yyyy-MM-dd");
        params.endDate = format(date.to, "yyyy-MM-dd");
      }

      const [statsRes, yearlyRes] = await Promise.all([
        api.get('/dashboard/stats', { params }),
        api.get('/dashboard/yearly-stats')
      ]);
      
      setData(statsRes.data);
      setYearlyData(yearlyRes.data);
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [date]);

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    const today = new Date();

    switch (value) {
      case "today":
        setDate({ from: today, to: today });
        break;
      case "yesterday":
        setDate({ from: subDays(today, 1), to: subDays(today, 1) });
        break;
      case "7d":
        setDate({ from: subDays(today, 6), to: today });
        break;
      case "30d":
        setDate({ from: subDays(today, 29), to: today });
        break;
      case "thisMonth":
        setDate({ from: startOfMonth(today), to: endOfMonth(today) });
        break;
    }
  };

  const getFilterLabel = (type: string) => {
    switch (type) {
      case "today": return "Hôm nay";
      case "yesterday": return "Hôm qua";
      case "7d": return "7 ngày qua";
      case "30d": return "30 ngày qua";
      case "thisMonth": return "Tháng này";
      case "custom": return "Tùy chọn";
      default: return "Khoảng thời gian";
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 w-full h-full overflow-y-auto bg-gray-50/30">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Thống kê kinh doanh
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Phân tích hiệu quả và sản phẩm bán chạy.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-500 whitespace-nowrap">
            <Filter size={16} /> Lọc theo:
          </div>
          {/* Quick Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full border border-gray-200 font-bold text-gray-700 bg-gray-50/50 hover:bg-gray-100 h-8 px-3 text-[13px] gap-2 transition-colors">
                <Filter size={13} className="text-primary/70" />
                {getFilterLabel(filterType)}
                <ChevronDown size={12} className="opacity-40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-gray-100 p-2 bg-white" align="end">
              <DropdownMenuLabel className="text-sm font-bold text-gray-700 ml-1">Khoảng thời gian</DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 bg-gray-50" />
              <DropdownMenuRadioGroup value={filterType} onValueChange={handleFilterChange}>
                <DropdownMenuRadioItem value="today" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Hôm nay</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="yesterday" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Hôm qua</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="7d" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-primary">7 ngày qua</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="30d" className="cursor-pointer rounded-xl font-bold p-2 text-xs">30 ngày qua</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="thisMonth" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Tháng này</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="custom" className="cursor-pointer rounded-xl font-bold p-2 text-xs italic">Tùy chọn...</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Picker Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "rounded-full border border-gray-200 font-bold text-gray-700 bg-gray-50/50 hover:bg-gray-100 h-8 px-3 text-[13px] transition-colors",
                  !date && "text-muted-foreground"
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
            <PopoverContent className="w-auto p-0 rounded-[2rem] shadow-2xl border-gray-100 bg-white" align="end">
              <Calendar
                mode="range"
                selected={date}
                onSelect={(range) => {
                  setDate(range);
                  if (range?.from && range?.to) setFilterType("custom");
                }}
                numberOfMonths={2}
                locale={vi}
              />
            </PopoverContent>
          </Popover>

          <Button onClick={fetchStats} variant="outline" className="bg-white rounded-full text-gray-700 cursor-pointer border-gray-200 h-8 px-4 text-xs font-bold shadow-none ml-2">
            <RefreshCw className={cn("mr-2 h-3.5 w-3.5 text-gray-500", loading && "animate-spin")} /> Làm mới
          </Button>
        </div>
      </div>

      {!data ? (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <RefreshCw className="animate-spin text-primary w-10 h-10" />
          <p className="text-gray-400 font-bold">Đang tổng hợp dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden relative group hover:shadow-xl transition-all duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <DollarSign size={80} />
              </div>
              <CardHeader className="pb-2">
                <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-[0.2em]">Tổng doanh thu</CardDescription>
                <CardTitle className="text-3xl font-black text-gray-900">
                  {data?.overview?.totalRevenue?.toLocaleString('vi-VN') || 0}đ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1.5 w-12 bg-primary rounded-full" />
                  <span className="text-xs font-bold text-primary">Tăng trưởng tốt</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden relative group hover:shadow-xl transition-all duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <ShoppingBag size={80} />
              </div>
              <CardHeader className="pb-2">
                <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-[0.2em]">Tổng đơn hàng</CardDescription>
                <CardTitle className="text-3xl font-black text-gray-900">{data?.overview?.totalOrders || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1.5 w-12 bg-blue-500 rounded-full" />
                  <span className="text-xs font-bold text-blue-500">Hoàn thành cao</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden relative group hover:shadow-xl transition-all duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Users size={80} />
              </div>
              <CardHeader className="pb-2">
                <CardDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-[0.2em]">Khách hàng mới</CardDescription>
                <CardTitle className="text-3xl font-black text-gray-900">{data?.overview?.totalUsers || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1.5 w-12 bg-amber-500 rounded-full" />
                  <span className="text-xs font-bold text-amber-500">Đang mở rộng</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Order Status Pie Chart */}
            <PieDonutText 
              completed={data?.overview?.completedOrders || 0} 
              cancelled={data?.overview?.cancelledOrders || 0} 
            />

            {/* Top Products Chart */}
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-6 flex flex-col">
              <CardHeader className="px-2">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                   <div className="w-2 h-6 bg-amber-500 rounded-full" />
                   Sản phẩm bán chạy
                </CardTitle>
                <CardDescription className="font-bold">Top 5 sản phẩm</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 mt-6 p-0 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      width={100}
                      tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }}
                      cursor={{ fill: '#f8fafc' }}
                      formatter={(value: any) => [value, "Số lượng"]}
                    />
                    <Bar dataKey="quantity" radius={[0, 12, 12, 0]} barSize={24}>
                      {(data?.topProducts || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-6">
              <CardHeader className="px-2">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                   <div className="w-2 h-6 bg-primary rounded-full" />
                   Biểu đồ doanh thu
                </CardTitle>
                <CardDescription className="font-bold">Biến động theo thời gian</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] mt-6 p-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.revenueByDay || []}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                      dy={10}
                      tickFormatter={(val) => {
                        const date = new Date(val);
                        return format(date, "dd/MM");
                      }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                      tickFormatter={(val) => `${val / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                      formatter={(value: number) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), 'Doanh thu']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Revenue Bar Chart */}
            <BarSimple data={yearlyData} />
          </div>

          {/* Unsold Products Table */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <div className="w-2 h-6 bg-red-500 rounded-full" />
                Sản phẩm chưa bán được
              </CardTitle>
              <CardDescription className="font-bold">Danh sách các loại quả chưa có lượt mua nào (tính đến hiện tại)</CardDescription>
            </CardHeader>
            <CardContent className="p-0 px-8 pb-8">
              <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="border-gray-50">
                      <TableHead className="w-20 text-center font-bold text-gray-700">ID</TableHead>
                      <TableHead className="font-bold text-gray-700">Tên sản phẩm</TableHead>
                      <TableHead className="font-bold text-gray-700 text-right">Giá bán</TableHead>
                      <TableHead className="font-bold text-gray-700 text-center">Tồn kho</TableHead>
                      <TableHead className="font-bold text-gray-700 text-center">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!data?.unsoldProducts || data.unsoldProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-gray-400 font-medium italic">
                          Tất cả sản phẩm đều đã có lượt mua!
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.unsoldProducts.map((product) => (
                        <TableRow key={product.id} className="border-gray-50 hover:bg-gray-50/30 transition-colors group">
                          <TableCell className="text-center font-bold text-gray-400 py-4 text-xs">#{product.id}</TableCell>
                          <TableCell className="font-bold text-gray-900 group-hover:text-primary transition-colors">{product.name}</TableCell>
                          <TableCell className="text-right font-black text-gray-900">
                            {product.price.toLocaleString('vi-VN')} đ / {product.unit}
                          </TableCell>
                          <TableCell className="text-center font-bold text-gray-600">
                            {product.stockQuantity} {product.unit}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-100 uppercase tracking-tighter">
                              Chưa bán được
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
