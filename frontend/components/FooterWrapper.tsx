'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterWrapper() {
  const pathname = usePathname();

  // Ẩn footer ở trang quản trị (admin), trang cá nhân (profile), và các trang auth
  const isHiddenRoute =
    pathname?.startsWith('/admin') ||
    pathname === '/profile' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/change-password' ||
    pathname === '/checkout' ||
    pathname === '/orders';

  if (isHiddenRoute) {
    return null;
  }

  return <Footer />;
}
