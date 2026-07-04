'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ChevronRight, Package, Truck, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();

  useEffect(() => {
    if (!orderId) {
      router.push('/');
    }
  }, [orderId, router]);

  if (!orderId) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-lg text-center space-y-6">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
          <CheckCircle2 size={48} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900">Đặt hàng thành công!</h1>
          <p className="text-gray-500">Cảm ơn bạn đã tin tưởng và ủng hộ FruiTaste.</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center text-left">
          <div>
            <p className="text-sm text-gray-500">Mã đơn hàng</p>
            <p className="font-bold text-gray-900 text-lg">#{orderId}</p>
          </div>
          <Link href={`/checkout/success/${orderId}`}>
            <Button variant="outline" className="rounded-full bg-white flex items-center gap-1 font-medium text-primary border-primary/20 hover:bg-primary/5">
              Xem chi tiết <ChevronRight size={16} />
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-3 pt-6 w-full">
          <Link href="/orders" className="w-full">
            <Button className="w-full h-12 rounded-full font-bold bg-primary hover:bg-green-600">
              Quản lý Đơn mua của tôi
            </Button>
          </Link>
          <Link href="/products" className="w-full">
            <Button variant="ghost" className="w-full h-12 rounded-full font-medium text-gray-500 hover:bg-gray-100">
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <SuccessContent />
    </Suspense>
  );
}