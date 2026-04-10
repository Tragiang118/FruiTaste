'use client';

import Link from 'next/link';
import { Package, Warehouse, ShoppingBag, BarChart3, ChevronRight, TrendingUp, Calendar, Clock, CreditCard, Ticket, Wallet } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') {
    return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="relative w-full rounded-[2rem] overflow-hidden bg-gradient-to-r from-primary to-[#059669] p-8 md:p-12 shadow-sm">

        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10">
          <svg viewBox="0 0 400 400" className="w-full h-full text-white" fill="currentColor">
            <rect x="50" y="100" width="100" height="40" rx="20" />
            <rect x="250" y="150" width="80" height="40" rx="20" />
            <circle cx="150" cy="250" r="30" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <p className="text-white/80 font-medium mb-1">Xin chào trở lại</p>
          <p className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">
            Đây là trang quản trị của bạn!
          </p>
          <p className="text-white/80 font-medium mb-6">Sử dụng thanh điều hướng bên trái để truy cập các chức năng quản trị khác nhau.</p>
        </div>
        
      </div>
    </div>
  );
}