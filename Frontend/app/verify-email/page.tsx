'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xác thực email của bạn...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Không tìm thấy mã xác thực. Vui lòng kiểm tra lại đường dẫn email.');
      return;
    }

    api.post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
        setMessage('Xác thực email thành công! Bây giờ bạn đã có thể đăng nhập.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Xác thực thất bại hoặc đường dẫn đã hết hạn.');
      });
  }, [token]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <BackButton className="absolute top-4 left-4" />
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-bold mb-6 text-green-600">FruiTaste</h2>
        
        {status === 'loading' && (
          <div className="text-gray-600 animate-pulse">
            <p>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-green-700 bg-green-50 p-4 rounded-md border border-green-200 mb-6">
            <p className="font-semibold text-lg">Chúc mừng!</p>
            <p className="mt-2">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-red-700 bg-red-50 p-4 rounded-md border border-red-200 mb-6">
            <p className="font-semibold text-lg">Lỗi xác thực</p>
            <p className="mt-2">{message}</p>
          </div>
        )}

        <Button 
          onClick={() => router.push('/login')} 
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={status === 'loading'}
        >
          {status === 'success' ? 'Đăng nhập ngay' : 'Quay lại trang Đăng nhập'}
        </Button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">Đang tải...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}