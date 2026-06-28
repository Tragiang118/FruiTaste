'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import GuestGuard from '@/components/GuestGuard';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);
  const [errorForgot, setErrorForgot] = useState('');
  
  // OTP states
  const [forgotStep, setForgotStep] = useState<'email' | 'otp'>('email');
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { login, checkAuth } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  // OTP Input Handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // chỉ cho nhập số
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.slice(-1); // chỉ lấy ký tự cuối
    setOtpValues(newOtpValues);

    // Auto-focus ô tiếp theo
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtpValues = [...otpValues];
    for (let i = 0; i < pastedData.length; i++) {
      newOtpValues[i] = pastedData[i];
    }
    setOtpValues(newOtpValues);
    // Focus last filled input or last input
    const focusIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[focusIndex]?.focus();
  };

  // Gửi email yêu cầu OTP
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!forgotEmail) {
      toast.error('Vui lòng nhập email');
      return;
    }

    setIsSubmittingForgot(true);
    setErrorForgot('');
    try {
      const response = await api.post('/auth/forgot-password', { email: forgotEmail });
      toast.success(response.data.message || 'Mã OTP đã được gửi đến email của bạn.');
      setForgotStep('otp');
      setOtpValues(['', '', '', '', '', '']);
      // Focus first OTP input after a brief delay
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      setErrorForgot(message);
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  // Xác minh OTP
  const handleVerifyOtp = async () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) {
      toast.error('Vui lòng nhập đầy đủ mã OTP 6 số');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await api.post('/auth/verify-otp', { email: forgotEmail, otp });
      // Backend đã set cookie → checkAuth để lấy user info
      await checkAuth();
      toast.success('Xác thực thành công! Vui lòng đổi mật khẩu mới.');
      setIsForgotModalOpen(false);
      // Chuyển hướng sang trang đổi mật khẩu bắt buộc
      router.push('/change-password');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Mã OTP không hợp lệ.';
      toast.error(message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Reset modal state khi đóng
  const handleModalClose = (open: boolean) => {
    if (!open) {
      setForgotStep('email');
      setOtpValues(['', '', '', '', '', '']);
      setForgotEmail('');
      setErrorForgot('');
    }
    setIsForgotModalOpen(open);
  };

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
      // Kiểm tra mustChangePassword
      const user = useAuthStore.getState().user;
      if (user?.mustChangePassword) {
        router.push('/change-password');
      } else if (redirectTo && redirectTo.startsWith('/')) {
        router.push(redirectTo);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(message);
    }
  };

  return (
    <GuestGuard>
    <div className="relative flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#FFFDFB] px-4 py-12">
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
                      <button 
                        type="button" 
                        className="text-sm font-medium text-[#FF6B4A] hover:underline cursor-pointer bg-transparent border-none p-0"
                        onClick={() => {
                          const currentEmail = form.getValues('email');
                          if (currentEmail) setForgotEmail(currentEmail);
                          setIsForgotModalOpen(true);
                        }}
                      >
                        Quên mật khẩu?
                      </button>
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
      
      {/* Forgot Password Modal - 2 Steps */}
      <Dialog open={isForgotModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8">
          {forgotStep === 'email' ? (
            <>
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-bold">Khôi phục mật khẩu</DialogTitle>
                <DialogDescription className="text-gray-500">
                  Nhập email của bạn. Chúng tôi sẽ gửi mã OTP 6 số để xác thực.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleForgotPassword} className="space-y-4 py-4">
                {errorForgot && (
                  <div className="text-sm text-red-500 text-center p-3 bg-red-50 rounded-xl mb-4 border border-red-100 font-medium">
                    {errorForgot}
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="forgot-email" className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="example@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="rounded-xl px-4 py-6 border-gray-200"
                    required
                  />
                </div>
                <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto bg-[#FF6B4A] hover:bg-[#E55A39] text-white py-6 px-8 rounded-xl font-semibold transition-all shadow-md shadow-orange-100 cursor-pointer"
                    disabled={isSubmittingForgot}
                  >
                    {isSubmittingForgot ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang gửi...
                      </span>
                    ) : 'Gửi mã OTP'}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            <>
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setForgotStep('email')} 
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                  </button>
                  <DialogTitle className="text-2xl font-bold">Nhập mã OTP</DialogTitle>
                </div>
                <DialogDescription className="text-gray-500">
                  Chúng tôi đã gửi mã OTP 6 số đến <span className="font-semibold text-gray-700">{forgotEmail}</span>. 
                  Mã có hiệu lực trong 5 phút.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* OTP Input Group */}
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otpValues.map((value, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={value}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 outline-none transition-all"
                    />
                  ))}
                </div>

                {/* Gửi lại OTP */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Không nhận được mã?{' '}
                    <button 
                      type="button"
                      onClick={handleForgotPassword as any}
                      disabled={isSubmittingForgot}
                      className="text-[#FF6B4A] font-semibold hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingForgot ? 'Đang gửi...' : 'Gửi lại'}
                    </button>
                  </p>
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button 
                  type="button"
                  onClick={handleVerifyOtp}
                  className="w-full bg-[#FF6B4A] hover:bg-[#E55A39] text-white py-6 rounded-xl font-semibold transition-all shadow-md shadow-orange-100 cursor-pointer"
                  disabled={isVerifyingOtp || otpValues.join('').length !== 6}
                >
                  {isVerifyingOtp ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xác thực...
                    </span>
                  ) : 'Xác nhận'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </GuestGuard>
  );
}