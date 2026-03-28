'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-green-600">FruiTaste</Link>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <>
            <span className="text-gray-600 text-sm">Xin chào, <strong>{user.fullName || user.email}</strong></span>
            <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </>
        ) : (
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-green-600">Đăng nhập</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-green-600 hover:bg-green-700 text-white">Đăng ký</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
