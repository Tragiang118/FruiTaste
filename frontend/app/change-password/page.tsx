'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  // Redirect nếu chưa đăng nhập hoặc không cần đổi mật khẩu
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user && !user.mustChangePassword) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const validateForm = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      newErrors.newPassword = 'Mật khẩu cần chữ hoa, chữ thường, số và ký tự đặc biệt';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await api.post('/users/profile/force-change-password', { newPassword });
      toast.success('Đổi mật khẩu thành công!');
      // Refresh user data
      await checkAuth();
      router.push('/');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      if (Array.isArray(message)) {
        toast.error(message[0]);
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#FFFDFB]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B4A]" />
      </div>
    );
  }

  // Nếu không phải mustChangePassword thì không render
  if (!user?.mustChangePassword) {
    return null;
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!newPassword) return { level: 0, text: '', color: '' };
    let score = 0;
    if (newPassword.length >= 6) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 2) return { level: score, text: 'Yếu', color: 'bg-red-400' };
    if (score <= 3) return { level: score, text: 'Trung bình', color: 'bg-yellow-400' };
    if (score <= 4) return { level: score, text: 'Khá', color: 'bg-blue-400' };
    return { level: score, text: 'Mạnh', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="relative flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#FFFDFB] px-4 py-12">
      <Card className="w-full max-w-md border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B4A] to-[#FF8A65] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-extrabold text-center text-[#1A1A1A]">
              Đổi mật khẩu mới
            </CardTitle>
            <p className="text-center text-gray-500 text-sm mt-2">
              Vui lòng tạo mật khẩu mới cho tài khoản của bạn để tiếp tục sử dụng.
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Mật khẩu mới */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
                  }}
                  className={`rounded-xl px-4 py-6 border-gray-200 focus-visible:ring-[#FF6B4A] ${
                    errors.newPassword ? 'border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-500 font-medium">{errors.newPassword}</p>
              )}

              {/* Password strength bar */}
              {newPassword && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i <= strength.level ? strength.color : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Độ mạnh: <span className="font-semibold">{strength.text}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  className={`rounded-xl px-4 py-6 border-gray-200 focus-visible:ring-[#FF6B4A] ${
                    errors.confirmPassword ? 'border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Gợi ý mật khẩu */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="text-xs text-orange-700 font-medium mb-2">Mật khẩu cần có:</p>
              <ul className="text-xs text-orange-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Ít nhất 6 ký tự
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Ít nhất 1 chữ in hoa
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Ít nhất 1 chữ in thường
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Ít nhất 1 chữ số
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${/[^A-Za-z0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Ít nhất 1 ký tự đặc biệt (!@#$%...)
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#FF6B4A] hover:bg-[#E55A39] text-white py-6 rounded-xl font-semibold text-lg mt-2 transition-all shadow-md shadow-orange-100 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                'Đổi mật khẩu'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
