'use client';

import { useAuthStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Warehouse, ShoppingBag, BarChart3, ChevronLeft, ChevronRight, Home, Menu, Bell, Wallet, Clock, MapPin, User, Users, Lock, LogOut, Tags, LayoutDashboard, ChefHat, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (!isMounted || isLoading) {
    return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">Đang tải...</div>;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  const adminModules = [
    { title: 'Quản trị', href: '/admin', icon: <Home size={20} /> },
    { title: 'Quản lý người dùng', href: '/admin/users', icon: <Users size={20} /> },
    { title: 'Quản lý danh mục', href: '/admin/categories', icon: <Tags size={20} /> },
    { title: 'Quản lý sản phẩm', href: '/admin/products', icon: <Package size={20} /> },
    { title: 'Quản lý kho', href: '/admin/inventory', icon: <Warehouse size={20} /> },
    { title: 'Quản lý đơn hàng', href: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { title: 'Quản lý món ăn', href: '/admin/recipes', icon: <ChefHat size={20} /> },
    { title: 'Thống kê', href: '/admin/statistics', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden admin-layout">

      <aside className={`max-md:hidden bg-white border-r border-gray-100 transition-all duration-300 flex flex-col h-full z-20 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className={`h-[88px] flex items-center flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'px-8 justify-start' : 'justify-center w-full'}`}>
          <Link href="/" className="flex items-center gap-3 overflow-hidden group">
             <img src="/durian-logo.png?v=3" alt="FruiTaste Logo" className="w-12 h-12 object-contain flex-shrink-0 group-hover:scale-110 transition-transform" />
             <div className={`flex items-center whitespace-nowrap transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}`}>
               <span className="text-2xl font-black text-gray-900 leading-none">Frui<span className="text-green-600">Taste</span></span>
             </div>
          </Link>
        </div>

        {/* User Card Removed */}
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2">
          {adminModules.map((module, index) => {
            const isActive = pathname === module.href;
            return (
              <div key={index} className="px-4">
                <Link href={module.href}>
                  <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-green-50 text-green-600 shadow-sm shadow-green-600/5 font-bold' 
                      : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 font-medium'
                  } ${!isSidebarOpen && 'justify-center px-0'}`}>
                    <div className={`flex-shrink-0 transition-colors ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                      {module.icon}
                    </div>
                    <span className={`whitespace-nowrap transition-all duration-200 text-[15px] ${isSidebarOpen ? 'opacity-100 flex-1' : 'opacity-0 w-0 hidden'}`}>
                      {module.title}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">


        <Drawer direction="left" open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <DrawerContent className="w-[85vw] max-w-[320px] p-0 h-full border-none flex flex-col bg-white shadow-2xl outline-none">
            <div className="sr-only">
              <DrawerTitle>Menu Quản trị</DrawerTitle>
              <DrawerDescription>Thanh điều hướng cho thiết bị di động</DrawerDescription>
            </div>
            <div className="p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileSidebarOpen(false)}>
                  <img src="/durian-logo.png?v=3" alt="FruiTaste Logo" className="w-12 h-12 object-contain flex-shrink-0" />
                  <span className="text-2xl font-black text-gray-900">
                    Frui<span className="text-green-600">Taste</span>
                  </span>
                </Link>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <ChevronLeft size={24} />
                  </Button>
                </DrawerClose>
              </div>

              {/* User Card Removed */}

              <div className="flex-1 overflow-y-auto -mx-2 px-2 flex flex-col gap-2">
                {adminModules.map((module, index) => {
                  const isActive = pathname === module.href;
                  return (
                    <Link key={index} href={module.href} onClick={() => setIsMobileSidebarOpen(false)}>
                      <div className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${
                        isActive 
                          ? 'bg-green-50 text-green-600 shadow-sm font-bold' 
                          : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 font-medium'
                      }`}>
                        <div className={isActive ? 'text-green-600' : ''}>{module.icon}</div>
                        <span className="text-[15px]">{module.title}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 px-4 py-6 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 font-medium transition-all"
                  onClick={async () => {
                    await logout();
                    router.push('/');
                  }}
                >
                  <LogOut size={20} />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b border-gray-100 flex-shrink-0 h-[88px]">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 bg-white shadow-sm md:flex hidden cursor-pointer"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 bg-white shadow-sm md:hidden flex cursor-pointer"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </Button>

            <div className="flex items-center gap-2 text-sm text-gray-500 ml-2">
                {/* Empty space to maintain layout if needed, or just remove if not needed */}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 rounded-full px-2 py-1 h-10 cursor-pointer" variant="outline">
                  <Avatar className="h-7 w-7 border-1 border-transparent hover:border-primary transition-all">
                    <AvatarImage src={getAvatarUrl(user?.avatar, user?.fullName || user?.email)} alt={user?.fullName || 'Avatar'} />
                    <AvatarFallback className="bg-primary text-white font-bold">
                      {(user?.fullName || user?.email || 'A').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium pr-1 text-sm text-gray-700 hidden sm:inline">{user?.fullName || 'Quản trị viên'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mt-2 rounded-xl shadow-lg border border-gray-100">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3 pb-2 pt-1">
                    <Avatar className="h-10 w-10 border border-gray-100">
                      <AvatarImage src={getAvatarUrl(user?.avatar, user?.fullName || user?.email)} alt={user?.fullName || 'Avatar'} />
                      <AvatarFallback className="font-bold bg-primary text-white">{(user?.fullName || user?.email || 'A').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 overflow-hidden">
                      <p className="font-medium text-sm leading-none truncate">{user?.fullName || 'Quản trị viên'}</p>
                      <p className="text-muted-foreground text-xs leading-none truncate">{user?.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer py-2.5 hover:text-[#FF6B4A] focus:text-[#FF6B4A] focus:bg-orange-50 transition-colors" onClick={() => router.push('/')}>
                    <Home className="mr-2" size={16} />
                    Trang chủ
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-2.5 hover:text-[#FF6B4A] focus:text-[#FF6B4A] focus:bg-orange-50 transition-colors" onClick={() => router.push('/profile')}>
                    <User className="mr-2" size={16} />
                    Hồ sơ cá nhân
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-2.5 hover:text-[#FF6B4A] focus:text-[#FF6B4A] focus:bg-orange-50 transition-colors" onClick={() => router.push('/orders')}>
                    <ShoppingBag className="mr-2" size={16} />
                    Đơn hàng
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-2.5 hover:text-[#FF6B4A] focus:text-[#FF6B4A] focus:bg-orange-50 transition-colors" onClick={() => router.push('/admin')}>
                    <LayoutDashboard className="mr-2" size={16} />
                    Quản lý
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-500 cursor-pointer text-sm font-semibold focus:text-red-600 focus:bg-red-50 py-2.5"
                  onClick={async () => {
                    await logout();
                    router.push('/');
                  }}
                >
                  <LogOut className="mr-2" size={16} />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full">
            <div className="flex items-center justify-between w-full mb-8">
                <div>
                   {pathname.split('/').length > 3 && (
                     <BackButton />
                   )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1 font-medium"><Home size={14} /> Trang chủ</Link>
                    <ChevronRight size={14} />
                    <Link href="/admin" className={`hover:text-[#FF6B4A] font-medium ${pathname === '/admin' ? 'text-[#FF6B4A]' : ''}`}>Quản trị</Link>
                    {pathname !== '/admin' && (
                      <>
                        <ChevronRight size={14} />
                        <span className="text-[#FF6B4A] font-medium truncate">
                          {adminModules.find(m => m.href === pathname)?.title || 'Chi tiết'}
                        </span>
                      </>
                    )}
                </div>
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}