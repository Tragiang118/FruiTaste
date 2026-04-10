'use client';

import { useAuthStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const protectedPaths = ['/profile', '/orders', '/checkout', '/admin']; 
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
        checkAuth();
        mounted.current = true;
    }
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && protectedPaths.some(p => pathname.startsWith(p))) {
        // Nếu truy cập vào trang yêu cầu xác thực mà chưa đăng nhập, chuyển hướng về trang login
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}