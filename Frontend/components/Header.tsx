'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Button } from './ui/button';
import { useRouter, usePathname } from 'next/navigation';
import CartSheet from './CartSheet';
import { Leaf, Phone, Mail, MapPin, Search, LayoutDashboard, Package, Warehouse, ShoppingBag, BarChart3, ChevronRight, User, Lock, LogOut } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname() || '';

  const adminModules = [
    {
      title: 'Quản lý sản phẩm',
      description: 'Thêm mới, chỉnh sửa thông tin, giá cả và hình ảnh sản phẩm.',
      icon: <Package className="w-8 h-8 text-[#FF6B4A]" />,
      color: 'bg-orange-50',
      href: '/admin/products',
    },
    {
      title: 'Quản lý kho',
      description: 'Theo dõi số lượng tồn kho, nhập hàng và cảnh báo sắp hết hàng.',
      icon: <Warehouse className="w-8 h-8 text-green-500" />,
      color: 'bg-green-50',
      href: '/admin/inventory',
    },
    {
      title: 'Quản lý đơn hàng',
      description: 'Xem chi tiết đơn hàng, cập nhật trạng thái giao hàng và thanh toán.',
      icon: <ShoppingBag className="w-8 h-8 text-blue-500" />,
      color: 'bg-blue-50',
      href: '/admin/orders',
    },
    {
      title: 'Thống kê',
      description: 'Báo cáo doanh thu, số lượng bán ra và phân tích khách hàng.',
      icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
      color: 'bg-purple-50',
      href: '/admin/statistics',
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-[#FFFDFB] sticky top-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center transition-all border-b border-gray-300">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-green-400 rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                <Leaf className="w-5 h-5 text-white" />
              </div>
                <Link href="/" className="text-2xl font-extrabold text-[#1A1A1A] flex items-center gap-2">
              <span className="text-xl font-black text-gray-900">Frui<span className="text-primary">Taste</span></span>
              </Link>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 font-medium text-sm">
        <Link href="/products" className={`px-4 py-2 rounded-full transition-all ${pathname.startsWith('/products') ? 'bg-[#FFF4E6] text-[#FF6B4A] font-bold' : 'text-gray-700 hover:text-[#FF6B4A] hover:bg-orange-50'}`}>Trái cây</Link>
        <Link href="/recipes" className={`px-4 py-2 rounded-full transition-all ${pathname.startsWith('/recipes') ? 'bg-[#FFF4E6] text-[#FF6B4A] font-bold' : 'text-gray-700 hover:text-[#FF6B4A] hover:bg-orange-50'}`}>Công thức</Link>
        <Link href="/about" className={`px-4 py-2 rounded-full transition-all ${pathname.startsWith('/about') ? 'bg-[#FFF4E6] text-[#FF6B4A] font-bold' : 'text-gray-700 hover:text-[#FF6B4A] hover:bg-orange-50'}`}>Về chúng tôi</Link>
      </div>

      <div className="flex items-center gap-4">
        {user?.role === 'ADMIN' ? (
          <Link href="/admin">
            <Button variant="ghost" className="text-gray-700 hover:text-[#FF6B4A] hover:bg-[#FFF4E6] rounded-full font-bold flex gap-2 h-10 px-4 transition-colors cursor-pointer">
              <LayoutDashboard size={20} className="stroke-[2.5px]" />
              <span className="hidden sm:inline">Quản lý</span>
            </Button>
          </Link>
        ) : (
          <CartSheet />
        )}
        <div className="hidden md:block w-px h-6 bg-gray-200 border border-gray-300"></div>
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2 rounded-full px-2 py-1 h-10 cursor-pointer" variant="outline">
                <Avatar className="h-7 w-7 border-1 border-transparent hover:border-primary transition-all">
                  <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName || user.email}`} alt={user.fullName || user.email} />
                  <AvatarFallback className="bg-primary text-white font-bold">{(user.fullName || user.email).charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium pr-1 text-sm text-gray-700 sm:inline hidden">{user.fullName || 'Người dùng'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 mt-2 rounded-xl shadow-lg border border-gray-100">
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3 pb-2 pt-1">
                  <Avatar className="h-10 w-10 border border-gray-100">
                    <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName || user.email}`} alt={user.fullName || user.email} />
                    <AvatarFallback className="font-bold bg-primary text-white">{(user.fullName || user.email).charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 overflow-hidden">
                    <p className="font-medium text-sm leading-none truncate">{user.fullName || 'Người dùng'}</p>
                    <p className="text-muted-foreground text-xs leading-none truncate">{user.email || ''}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer py-2.5 hover:text-[#FF6B4A] focus:text-[#FF6B4A] focus:bg-orange-50 transition-colors" onClick={() => router.push('/profile')}>
                  <User className="mr-2" size={16} />
                  Hồ sơ cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2.5 hover:text-[#FF6B4A] focus:text-[#FF6B4A] focus:bg-orange-50 transition-colors">
                  <Lock className="mr-2" size={16} />
                  Mật khẩu & Bảo mật
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 cursor-pointer text-sm font-semibold focus:text-red-600 focus:bg-red-50 py-2.5" onClick={handleLogout}>
                <LogOut className="mr-2" size={16} />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-[#FF6B4A] rounded-full px-6 font-medium cursor-pointer">Đăng nhập</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#FF6B4A] hover:bg-[#E55A39] text-white rounded-full px-6 font-medium shadow-md shadow-orange-100 hidden sm:flex cursor-pointer">Đăng ký</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
