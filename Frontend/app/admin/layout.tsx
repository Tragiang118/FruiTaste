'use client';

import { useAuthStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Warehouse, ShoppingBag, BarChart3, ChevronLeft, ChevronRight, Home, Menu, Bell, Wallet, Clock, MapPin, Leaf, User, Lock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop
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
    { title: 'Trang chủ', href: '/admin', icon: <Home size={20} /> },
    { title: 'Quản lý sản phẩm', href: '/admin/products', icon: <Package size={20} /> },
    { title: 'Quản lý kho', href: '/admin/inventory', icon: <Warehouse size={20} /> },
    { title: 'Quản lý đơn hàng', href: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { title: 'Thống kê', href: '/admin/statistics', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className={`max-md:hidden bg-white border-r border-gray-100 transition-all duration-300 flex flex-col h-full z-20 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className={`h-[88px] border-b border-gray-50 flex items-center flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'px-6 justify-start' : 'justify-center w-full'}`}>
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
             <div className="w-9 h-9 bg-gradient-to-br from-primary to-green-500 rounded-xl flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0">
                <Leaf className="w-5 h-5 text-white" />
             </div>
             <div className={`flex items-center whitespace-nowrap transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}`}>
               <span className="text-xl font-black text-gray-900 leading-none">Frui<span className="text-primary">Taste</span></span>
             </div>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2">
          {adminModules.map((module, index) => {
            const isActive = pathname === module.href;
            return (
              <div key={index} className="px-3">
                <Link href={module.href}>
                  <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold ${
                    isActive 
                      ? 'bg-[#F2F6F3] text-primary shadow-sm' 
                      : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                  } ${!isSidebarOpen && 'justify-center px-0'}`}>
                    <div className="flex-shrink-0">{module.icon}</div>
                    <span className={`whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100 flex-1' : 'opacity-0 w-0 hidden'}`}>
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
          <DrawerContent className="w-[80vw] sm:w-[350px] p-0 rounded-none h-full border-r border-gray-100 flex flex-col bg-white">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between h-[88px] flex-shrink-0">
              <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileSidebarOpen(false)}>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Frui<span className="text-primary font-black uppercase text-sm ml-1 tracking-widest">Taste</span>
                </span>
              </Link>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={20} />
                </Button>
              </DrawerClose>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
              {adminModules.map((module, index) => {
                const isActive = pathname === module.href;
                return (
                  <Link key={index} href={module.href} onClick={() => setIsMobileSidebarOpen(false)}>
                    <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold ${
                      isActive 
                        ? 'bg-[#F2F6F3] text-primary shadow-sm' 
                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                    }`}>
                      {module.icon}
                      <span>{module.title}</span>
                    </div>
                  </Link>
                );
              })}
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

            <Link href="/" className="hidden sm:inline-flex">
              <Button variant="ghost" className="text-gray-500 hover:text-[#FF6B4A] hover:bg-orange-50 font-semibold rounded-xl flex items-center gap-2 transition-colors h-10 px-4 cursor-pointer">
                <ChevronLeft size={18} />
                Về cửa hàng
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 rounded-full px-2 py-1 h-10 cursor-pointer" variant="outline">
                  <Avatar className="h-7 w-7 border-1 border-transparent hover:border-primary transition-all">
                    <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName || user?.email || 'A'}`} alt={user?.fullName || 'Avatar'} />
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
                      <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName || user?.email || 'A'}`} alt={user?.fullName || 'Avatar'} />
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
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}