'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import GuestGuard from '@/components/GuestGuard';
import BackButton from '@/components/BackButton';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginValues } from '@/lib/schemas/auth';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setError('');
    try {
      await login(data);
      router.push('/'); 
    } catch (err: any) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(message);
    }
  };

  return (
    <GuestGuard>
    <div className="relative flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#FFFDFB] px-4 py-12">
      <BackButton className="absolute top-4 left-4" />
      <Card className="w-full max-w-md border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-3xl font-extrabold text-center text-[#1A1A1A] ">Đăng nhập</CardTitle>
          <p className="text-center text-gray-500 text-sm mt-2">Chào mừng bạn quay lại với FruiTaste</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-sm text-red-500 text-center p-3 bg-red-50 rounded-xl mb-5 border border-red-100 font-medium">
              {error}
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Ví dụ: example@email.com" className="rounded-xl px-4 py-6 border-gray-200 focus-visible:ring-[#FF6B4A]" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-gray-700 font-medium">Mật khẩu</FormLabel>
                      <Link className="text-sm font-medium text-[#FF6B4A] hover:underline" href="#">
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Nhập mật khẩu của bạn" 
                          className="rounded-xl px-4 py-6 border-gray-200 focus-visible:ring-[#FF6B4A]"
                          {...field} 
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-[#FF6B4A] hover:bg-[#E55A39] text-white py-6 rounded-xl font-semibold text-lg mt-2 transition-all shadow-md shadow-orange-100 cursor-pointer">
                Đăng nhập
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-[#FF6B4A] font-semibold hover:underline cursor-pointer">
              Đăng ký ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
    </GuestGuard>
  );
}