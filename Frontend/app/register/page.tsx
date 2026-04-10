'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import GuestGuard from '@/components/GuestGuard';
import BackButton from '@/components/BackButton';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
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
import { Field, FieldLabel as ShadcnFieldLabel, FieldDescription } from '@/components/ui/field';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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

      setSuccess(true);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
      
      // Đã XÓA tính năng tự động chuyển hướng để khách hàng biết bắt buộc phải vào email
      form.reset();

    } catch (err: any) {
      console.log("Registration error:", err);

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
    <div className="relative flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#FFFDFB] px-4 py-12">
      <BackButton className="absolute top-4 left-4" />
      <Card className="w-full max-w-md border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-3xl font-extrabold text-center text-[#1A1A1A]">Đăng ký</CardTitle>
          <p className="text-center text-gray-500 text-sm mt-2">Tạo tài khoản mới với FruiTaste</p>
        </CardHeader>
        <CardContent>
        
        {success && (
          <div className="text-sm text-green-700 text-center p-4 bg-green-50 rounded-xl mb-5 border border-green-100">
            <p className="font-bold text-lg mb-1">Đăng ký thành công!</p>
            <p className="mt-2 text-green-600">Vui lòng đăng nhập vào Email của bạn (kiểm tra cả mục Thư rác/Spam nếu không thấy) và nhấn nút <b>"Xác thực Email"</b> để kích hoạt tài khoản.</p>
          </div>
        )}

        {error && (
            <div className="text-sm text-red-500 text-center p-3 bg-red-50 rounded-xl mb-5 border border-red-100 font-medium">
              {error}
            </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Nguyễn Văn A" className="rounded-xl px-4 py-6 border-gray-200 focus-visible:ring-[#FF6B4A]" {...field} autoComplete="off" />
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
                  <Field>
                    <ShadcnFieldLabel className="text-gray-700 font-medium mb-1">Mật khẩu</ShadcnFieldLabel>
                    <FieldDescription className="text-xs text-gray-500 mb-2">
                      Yêu cầu: Tối thiểu 6 ký tự, gồm ít nhất 1 chữ in hoa, 1 chữ in thường, 1 số và 1 ký tự đặc biệt.
                    </FieldDescription>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu"
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
                  </Field>
                  {form.formState.errors.password && (
                    <div className="text-sm font-medium text-red-500 space-y-1 mt-2">
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

            <Button type="submit" className="w-full bg-[#FF6B4A] hover:bg-[#E55A39] text-white py-6 rounded-xl font-semibold text-lg mt-2 transition-all shadow-md shadow-orange-100 cursor-pointer">
              Đăng ký
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-[#FF6B4A] font-semibold hover:underline cursor-pointer">
            Đăng nhập ngay
          </Link>
        </div>
        </CardContent>
      </Card>
    </div>
    </GuestGuard>
  );
}
