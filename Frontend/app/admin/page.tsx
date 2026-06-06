'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Warehouse, 
  ShoppingBag, 
  BarChart3, 
  ChevronRight, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  PlusCircle, 
  Eye, 
  ArrowRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChefHat,
  LayoutDashboard,
  Zap
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/dashboard/stats', { params: { startDate: today, endDate: today } }),
        api.get('/orders/admin')
      ]);
      
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.slice(0, 5));
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchDashboardData();
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="animate-spin text-primary w-10 h-10" />
        <p className="text-gray-400 font-bold">Đang tải dữ liệu quản trị...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-700">
      {/* Welcome Banner */}
      <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-gray-900 via-green-900 to-primary p-8 md:p-12 shadow-2xl group">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <svg viewBox="0 0 400 400" className="w-full h-full text-white" fill="currentColor">
            <rect x="50" y="100" width="100" height="40" rx="20" />
            <rect x="250" y="150" width="80" height="40" rx="20" />
            <circle cx="150" cy="250" r="30" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tighter flex items-center gap-4">
            <LayoutDashboard className="w-10 h-10 md:w-14 md:h-14 text-green-400 opacity-80" />
            <span>Chào mừng trở lại, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200">{user?.fullName?.split(' ')[0] || 'Admin'}</span>!</span>
          </h1>
          <p className="text-white/70 text-lg font-medium mb-8 max-w-lg leading-relaxed">
            Hôm nay FruiTaste đã có <span className="text-white font-black underline">{stats?.overview?.totalOrders || 0} đơn hàng mới</span>. Hãy cùng kiểm tra hiệu quả kinh doanh của ngày hôm nay nhé.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => router.push('/admin/orders')} className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 h-12 font-black text-sm shadow-xl shadow-white/10 transition-all cursor-pointer">
              Xử lý đơn hàng
            </Button>
            <Button onClick={() => router.push('/admin/statistics')} variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full px-8 h-12 font-black text-sm backdrop-blur-sm transition-all cursor-pointer">
              Xem báo cáo chi tiết
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                <DollarSign size={24} />
              </div>
              <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">Hôm nay</span>
            </div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Doanh thu ngày</p>
            <h3 className="text-2xl font-black text-gray-900">{stats?.overview?.totalRevenue?.toLocaleString('vi-VN') || 0}đ</h3>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <ShoppingBag size={24} />
              </div>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">Đơn mới</span>
            </div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Số lượng đơn</p>
            <h3 className="text-2xl font-black text-gray-900">{stats?.overview?.totalOrders || 0} Đơn</h3>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase tracking-wider">Thành viên</span>
            </div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Tổng khách hàng</p>
            <h3 className="text-2xl font-black text-gray-900">{stats?.overview?.totalUsers || 0} User</h3>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
              <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-full uppercase tracking-wider">Cần xử lý</span>
            </div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Chờ xác nhận</p>
            <h3 className="text-2xl font-black text-gray-900">{stats?.overview?.pendingOrders || 0} Đơn</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <Card className="xl:col-span-2 rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Đơn hàng gần đây
              </CardTitle>
              <CardDescription className="font-bold">5 giao dịch mới nhất trên hệ thống</CardDescription>
            </div>
            <Button variant="ghost" onClick={() => router.push('/admin/orders')} className="rounded-full font-bold text-primary hover:bg-primary/5 cursor-pointer">
              Xem tất cả <ArrowRight size={16} className="ml-2" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 px-8 pb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="text-left p-4 font-bold text-gray-700">Đơn hàng</th>
                    <th className="text-left p-4 font-bold text-gray-700">Khách hàng</th>
                    <th className="text-right p-4 font-bold text-gray-700">Tổng tiền</th>
                    <th className="text-center p-4 font-bold text-gray-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-400 font-medium italic">Không có đơn hàng nào gần đây</td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <span className="font-black text-gray-900">#{order.id}</span>
                          <p className="text-[10px] text-gray-400 font-bold">{format(new Date(order.createdAt), 'HH:mm - dd/MM')}</p>
                        </td>
                        <td className="p-4 font-bold text-gray-700">{order.shippingName}</td>
                        <td className="p-4 text-right font-black text-gray-900">{order.finalAmount.toLocaleString('vi-VN')}đ</td>
                        <td className="p-4 text-center">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                            order.status === 'COMPLETED' ? "bg-green-50 text-green-600" :
                            order.status === 'CANCELLED' ? "bg-red-50 text-red-600" :
                            order.status === 'PREPARING' ? "bg-amber-50 text-amber-600" :
                            order.status === 'SHIPPING' ? "bg-purple-50 text-purple-600" :
                            order.status === 'PENDING' ? "bg-blue-50/50 text-blue-400" :
                            "bg-blue-50 text-blue-600" // CONFIRMED default
                          )}>
                            {order.status === 'COMPLETED' ? 'Hoàn thành' :
                             order.status === 'CANCELLED' ? 'Đã hủy' : 
                             order.status === 'PENDING' ? 'Chờ xác nhận' : 
                             order.status === 'CONFIRMED' ? 'Đã duyệt' : 
                             order.status === 'PREPARING' ? 'Đang chuẩn bị' :
                             order.status === 'SHIPPING' ? 'Đang giao' : 'Đang xử lý'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <div className="flex flex-col gap-6">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden p-8">
            <CardTitle className="text-xl font-black flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-amber-500" />
              Thao tác nhanh
            </CardTitle>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => router.push('/admin/products')}
                className="flex flex-col items-center justify-center p-6 rounded-3xl bg-green-50 text-green-600 hover:bg-green-100 transition-all gap-3 group cursor-pointer border-none outline-none"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Package size={24} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Sản phẩm</span>
              </button>
              <button 
                onClick={() => router.push('/admin/inventory')}
                className="flex flex-col items-center justify-center p-6 rounded-3xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all gap-3 group cursor-pointer border-none outline-none"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Warehouse size={24} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Kho hàng</span>
              </button>
              <button 
                onClick={() => router.push('/admin/recipes')}
                className="flex flex-col items-center justify-center p-6 rounded-3xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all gap-3 group cursor-pointer border-none outline-none"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <ChefHat size={24} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Món ăn</span>
              </button>
              <button 
                onClick={() => router.push('/admin/users')}
                className="flex flex-col items-center justify-center p-6 rounded-3xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all gap-3 group cursor-pointer border-none outline-none"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Tài khoản</span>
              </button>
            </div>
          </Card>

          {/* System Status Card */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-gradient-to-br from-primary to-green-700 text-white overflow-hidden p-8 relative">
             <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12">
               <Leaf size={160} />
             </div>
             <div className="relative z-10">
               <h4 className="text-lg font-black mb-2">Lời nhắc quản trị</h4>
               <p className="text-white/80 text-sm font-medium leading-relaxed mb-6">
                 Đừng quên kiểm tra các đơn hàng đang chờ xử lý để đảm bảo giao hàng đúng hạn cho khách nhé!
               </p>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper component for Leaf icon in system status
function Leaf({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C10.9 14.36 12 13.48 14 11" />
    </svg>
  );
}
