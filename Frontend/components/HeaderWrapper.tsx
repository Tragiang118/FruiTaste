'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function HeaderWrapper() {
  const pathname = usePathname();

  // Không render Header chung nếu đang ở các trang quản trị
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <Header />;
}