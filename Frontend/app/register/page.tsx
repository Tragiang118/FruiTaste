'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import GuestGuard from '@/components/GuestGuard';
import { toast } from 'sonner';
import { useForm } from '@/node_modules/react-hook-form/dist';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, RegisterValues } from '@/lib/schemas/auth';
import { Eye, EyeOff } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser } = useAuthStore();
  const router = useRouter();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    criteriaMode: "all",
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  });

  const onSubmit = async (data: RegisterValues) => {
    setError('');
    setSuccess(false);
    try {
      const newUser = await registerUser(data);
      
      const realVerificationToken = newUser.verificationToken;

      // Gọi API gửi email
      const mailRes = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          firstName: data.fullName || 'bạn',
          verificationToken: realVerificationToken,
        }),
      });

      if (!mailRes.ok) {
        throw new Error('Không thể gửi email xác thực. Vui lòng thử lại sau.');
      }

      // Hiển thị thông báo yêu cầu kiểm tra email
      setSuccess(true);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
      
      // Đã XÓA tính năng tự động chuyển hướng để khách hàng biết bắt buộc phải vào email
      form.reset();

    } catch (err: any) {
      // Log lỗi ra console để debug (nếu cần)
      console.log("Registration error:", err);

      // Xử lý lỗi 409 Conflict (Email/User đã tồnại)
      if (err.response?.status === 409) {
        setError('Email đã tồn tại trên hệ thống.');
        return;
      }

      let message = err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.';
      if (Array.isArray(message)) {
        message = message.join(', ');
      }
      
      setError(message);
    }
  };

  return (
    <GuestGuard>
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">Đăng ký FruiTaste</h2>
        
        {success && (
          <div className="text-sm text-green-700 text-center p-4 bg-green-100 rounded-md mb-4 border border-green-200">
            <p className="font-bold text-lg mb-1">Đăng ký thành công!</p>
            <p className="mt-2">Vui lòng đăng nhập vào Email của bạn (kiểm tra cả mục Thư rác/Spam nếu không thấy) và nhấn nút <b>"Xác thực Email"</b> để kích hoạt tài khoản.</p>
          </div>
        )}

        {error && (
            <div className="text-sm text-red-500 text-center p-2 bg-red-50 rounded-md mb-4 border border-red-200">
              {error}
            </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập họ và tên" {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Nhập email" {...field} autoComplete="off" />
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
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <div className="text-xs text-gray-500 mt-1 pb-1">
                    Yêu cầu: Tối thiểu 6 ký tự, gồm ít nhất 1 chữ in hoa, 1 chữ in thường, 1 số và 1 ký tự đặc biệt.
                  </div>
                  {/* Hiển thị tất cả các lỗi của mật khẩu cùng lúc */}
                  {form.formState.errors.password && (
                    <div className="text-sm font-medium text-red-500 space-y-1">
                      {form.formState.errors.password.types ? (
                        Object.values(form.formState.errors.password.types).flat().map((msg, idx) => (
                          <p key={idx}>• {msg as string}</p>
                        ))
                      ) : (
                        <p>• {form.formState.errors.password.message}</p>
                      )}
                    </div>
                  )}
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
              Đăng ký
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-green-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
    </GuestGuard>
  );
}