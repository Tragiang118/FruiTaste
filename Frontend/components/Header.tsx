'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Button } from './ui/button';
import { useRouter, usePathname } from 'next/navigation';
import CartSheet from './CartSheet';
import { Leaf, Phone, Mail, MapPin, Search, LayoutDashboard, Package, Warehouse, ShoppingBag, BarChart3, ChevronRight, User, Lock, LogOut, Menu, ChevronLeft, Home } from 'lucide-react'
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
import { getAvatarUrl } from '@/lib/utils';


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
          <Drawer direction="left">
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-xl hover:bg-orange-50 text-gray-700 cursor-pointer">
                <Menu size={24} />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="w-[85vw] max-w-[320px] p-0 h-full border-none bg-white shadow-2xl flex flex-col outline-none">
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <img src="/durian-logo.png" alt="FruiTaste Logo" className="w-14 h-14 object-contain rounded-2xl" />
                    <span className="text-2xl font-black text-gray-900 leading-none">
                      Frui<span className="text-green-600">Taste</span>
                    </span>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 cursor-pointer">
                      <ChevronLeft size={24} />
                    </Button>
                  </DrawerClose>
                </div>

                <nav className="flex-1 space-y-3">
                  {[
                    { label: 'Trang chủ', href: '/' },
                    { label: 'Trái cây', href: '/products' },
                    { label: 'Món ăn', href: '/recipes' },
                    { label: 'Về chúng tôi', href: '/about' },
                  ].map((item) => (
                    <Link key={item.href} href={item.href}>
                      <DrawerClose asChild>
                        <div className={`px-5 py-4 rounded-2xl font-bold transition-all ${
                          (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href))
                            ? 'bg-green-50 text-green-600'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}>
                          {item.label}
                        </div>
                      </DrawerClose>
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-50">
                  {!isAuthenticated || !user ? (
                    <div className="flex flex-col gap-3">
                      <Link href="/login" className="w-full">
                        <DrawerClose asChild>
                          <Button variant="outline" className="w-full py-6 rounded-2xl font-bold border-gray-100 hover:bg-gray-50 transition-all cursor-pointer">
                            Đăng nhập
                          </Button>
                        </DrawerClose>
                      </Link>
                      <Link href="/register" className="w-full">
                        <DrawerClose asChild>
                          <Button className="w-full py-6 rounded-2xl font-bold bg-[#FF6B4A] hover:bg-[#E55A39] text-white shadow-lg shadow-orange-200 transition-all cursor-pointer">
                            Đăng ký ngay
                          </Button>
                        </DrawerClose>
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          <Link href="/" className="text-2xl font-extrabold text-[#1A1A1A] flex items-center gap-2.5">
            <img src="/durian-logo.png" alt="FruiTaste Logo" className="w-14 h-14 object-contain rounded-xl" />
            <span className="text-xl font-black text-gray-900 leading-none">Frui<span className="text-green-600">Taste</span></span>
          </Link>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 font-medium text-sm">
        <Link href="/products" className={`px-4 py-2 rounded-full transition-all ${pathname.startsWith('/products') ? 'bg-[#FFF4E6] text-[#FF6B4A] font-bold' : 'text-gray-700 hover:text-[#FF6B4A] hover:bg-orange-50'}`}>Trái cây</Link>
        <Link href="/recipes" className={`px-4 py-2 rounded-full transition-all ${pathname.startsWith('/recipes') ? 'bg-[#FFF4E6] text-[#FF6B4A] font-bold' : 'text-gray-700 hover:text-[#FF6B4A] hover:bg-orange-50'}`}>Món ăn</Link>
        <Link href="/about" className={`px-4 py-2 rounded-full transition-all ${pathname.startsWith('/about') ? 'bg-[#FFF4E6] text-[#FF6B4A] font-bold' : 'text-gray-700 hover:text-[#FF6B4A] hover:bg-orange-50'}`}>Về chúng tôi</Link>
      </div>

      <div className="flex items-center gap-4">
        <CartSheet />
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2 rounded-full px-2 py-1 h-10 cursor-pointer" variant="outline">
                <Avatar className="h-7 w-7 border-1 border-transparent hover:border-primary transition-all">
                  <AvatarImage src={getAvatarUrl(user.avatar, user.fullName || user.email)} alt={user.fullName || user.email} />
                  <AvatarFallback className="bg-primary text-white font-bold">{(user.fullName || user.email).charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium pr-1 text-sm text-gray-700 sm:inline hidden">{user.fullName || 'Người dùng'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 mt-2 rounded-xl shadow-lg border border-gray-100">
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3 pb-2 pt-1">
                  <Avatar className="h-10 w-10 border border-gray-100">
                    <AvatarImage src={getAvatarUrl(user.avatar, user.fullName || user.email)} alt={user.fullName || user.email} />
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
                <DropdownMenuItem className="cursor-pointer py-2.5 hover:text-[#FF6B4A] focus:text-[#FF6B4A] focus:bg-orange-50 transition-colors" onClick={() => router.push('/.')}  >
                  <Home className="mr-2" size={16} />
                  Trang chủ
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2.5 hover:text-[#FF6B4A] focus:text-[#FF6B4A] focus:bg-orange-50 transition-colors" onClick={() => router.push('/profile')}>
                  <User className="mr-2" size={16} />
                  Thông tin cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2.5 hover:text-[#FF6B4A] focus:text-[#FF6B4A] focus:bg-orange-50 transition-colors" onClick={() => router.push('/orders')}>
                  <ShoppingBag className="mr-2" size={16} />
                  Đơn hàng
                </DropdownMenuItem>
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem className="cursor-pointer py-2.5 hover:text-[#FF6B4A] focus:text-[#FF6B4A] focus:bg-orange-50 transition-colors" onClick={() => router.push('/admin')}>
                    <LayoutDashboard className="mr-2" size={16} />
                    Quản lý
                  </DropdownMenuItem>
                )}
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
