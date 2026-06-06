'use client';

import React, { useState, useRef } from 'react';
import { Camera, Edit2, Loader2, ChevronRight, User, Phone, Mail, Lock, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from 'axios';
import api from '@/lib/axios';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import {
  ImageCrop,
  ImageCropContent,
  ImageCropReset,
  ImageCropApply,
} from '@/components/ui/image-crop';
import { getAvatarUrl } from '@/lib/utils';
import AddressManager from './AddressManager';


interface ProfileInfoProps {
  user: any;
  activeTab: string;
}

export default function ProfileInfo({ user, activeTab }: ProfileInfoProps) {
  const { checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [croppedAvatar, setCroppedAvatar] = useState<string | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingField, setEditingField] = useState<'fullName' | 'phone' | 'email' | 'password' | null>(null);
  const [isWaitingVerification, setIsWaitingVerification] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{
    fullName?: string, 
    phone?: string, 
    email?: string,
    oldPassword?: string,
    newPassword?: string,
    confirmPassword?: string
  }>({});

  // Polling để kiểm tra trạng thái xác thực email
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWaitingVerification) {
      interval = setInterval(async () => {
        try {
          const res = await api.get('/auth/profile');
          const updatedUser = res.data;
          // Nếu email đã khớp với email mới và không còn pendingEmail nữa
          if (updatedUser.email === formData.email && !updatedUser.pendingEmail) {
            setIsWaitingVerification(false);
            setEditingField(null);
            await checkAuth();
            toast.success('Xác thực email thành công!');
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 3000); // Poll mỗi 3 giây
    }
    return () => clearInterval(interval);
  }, [isWaitingVerification, formData.email, checkAuth]);

  const validateForm = () => {
    const newErrors: any = {};
    
    if (editingField === 'fullName') {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Họ và tên không được bỏ trống';
      } else if (/[!@#$%^&*(),.?":{}|<>]/.test(formData.fullName)) {
        newErrors.fullName = 'Họ và tên không được chứa ký tự đặc biệt';
      } else if (formData.fullName.replace(/\s/g, '').length < 2) {
        newErrors.fullName = 'Họ và tên phải có tối thiểu 2 ký tự';
      } else if (formData.fullName.length > 30){
        newErrors.fullName = 'Họ và tên phải có tối đa 30 ký tự';
      }
    }

    if (editingField === 'phone') {
      if (!formData.phone) {
        newErrors.phone = 'Số điện thoại không được bỏ trống';
      } else if (!formData.phone.startsWith('0') || formData.phone.length < 10 || formData.phone.length > 11 || !/^\d+$/.test(formData.phone)) {
        newErrors.phone = 'Số điện thoại không hợp lệ';
      }
    }

    if (editingField === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email không được bỏ trống';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }
    }

    if (editingField === 'password') {
      if (!formData.oldPassword) {
        newErrors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      } else if (!/[A-Z]/.test(formData.newPassword) || !/[a-z]/.test(formData.newPassword) || !/[0-9]/.test(formData.newPassword) || !/[^A-Za-z0-9]/.test(formData.newPassword)) {
        newErrors.newPassword = 'Mật khẩu yếu (Cần chữ hoa, chữ thường, số và ký tự đặc biệt)';
      } else if (formData.newPassword === formData.oldPassword) {
        newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
      }

      if (formData.confirmPassword !== formData.newPassword) {
        newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingField === 'password') {
        await api.patch('/users/profile/change-password', {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        });
        toast.success('Đổi mật khẩu thành công!');
        setEditingField(null);
        setFormData({ ...formData, oldPassword: '', newPassword: '', confirmPassword: '' });
        return;
      }

      if (editingField === 'email') {
        const isEmailChanged = formData.email !== user?.email;
        if (isEmailChanged) {
          const res = await api.patch('/users/profile/request-email-change', {
            newEmail: formData.email
          });
          const verificationToken = res.data.verificationToken;
          
          await axios.post('/api/send', {
            email: formData.email,
            firstName: formData.fullName || user?.fullName || 'Người dùng',
            verificationToken: verificationToken
          });
          
          setIsWaitingVerification(true);
          toast.info('Đã gửi liên kết xác thực! Vui lòng kiểm tra email.', { duration: 6000 });
          return; // Không đóng modal, chuyển sang trạng thái chờ
        }
      }

      // Cập nhật fullName hoặc phone
      await api.patch('/users/profile/update', formData);
      await checkAuth();
      toast.success('Cập nhật thành công!');
      setEditingField(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setIsCropDialogOpen(true);
    }
  };

  const uploadAvatar = async (base64Image: string) => {
    setLoading(true);
    try {
      // Convert base64 to blob
      const res = await fetch(base64Image);
      const blob = await res.blob();
      const file = new File([blob], 'avatar.png', { type: 'image/png' });

      const formData = new FormData();
      formData.append('file', file);

      await api.post('/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await checkAuth();
      toast.success('Cập nhật ảnh đại diện thành công!');
      setIsCropDialogOpen(false);
      setAvatarFile(null);
      setCroppedAvatar(null);
    } catch (error) {
      toast.error('Cập nhật ảnh đại diện thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const ProfileRow = ({ label, value, onClick, icon: Icon, valueClassName = "" }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between py-5 px-4 hover:bg-gray-50/80 transition-all rounded-2xl group active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-green-600 transition-colors shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-gray-600 font-medium text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-gray-900 font-bold text-sm ${valueClassName}`}>{value || 'Chưa thiết lập'}</span>
        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </button>
  );

  return (
    <div className="space-y-8">
      {activeTab === 'profile' && (
        <>
          {/* Header Profile */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[100px] -z-0 opacity-50" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gray-100 flex items-center justify-center text-4xl font-bold text-gray-400 border-4 border-white shadow-md overflow-hidden">
                  {user?.avatar ? (
                    <img 
                      src={getAvatarUrl(user.avatar)} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    user?.fullName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-green-500 text-white p-2 rounded-2xl shadow-lg hover:bg-green-600 transition-colors border-2 border-white"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              <div className="flex flex-col gap-1 text-center md:text-left">
                <h2 className="text-2xl font-black text-gray-900">{user?.fullName || 'Người dùng FruiTaste'}</h2>
                <p className="text-gray-400 font-medium text-sm">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings List */}
          <div className="space-y-6">
            <div>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4">Tài khoản & Hồ sơ</h3>
              <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-gray-50 space-y-1">
                <ProfileRow 
                  label="Họ và tên" 
                  value={user?.fullName} 
                  icon={User} 
                  onClick={() => {
                    setEditingField('fullName');
                    setFormData({ ...formData, fullName: user?.fullName || '' });
                  }} 
                />
                <ProfileRow 
                  label="Số điện thoại" 
                  value={user?.phone} 
                  icon={Phone} 
                  onClick={() => {
                    setEditingField('phone');
                    setFormData({ ...formData, phone: user?.phone || '' });
                  }} 
                />
                <ProfileRow 
                  label="Email" 
                  value={user?.email} 
                  icon={Mail} 
                  onClick={() => {
                    setEditingField('email');
                    setFormData({ ...formData, email: user?.email || '' });
                  }} 
                />
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4">Bảo mật</h3>
              <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-gray-50">
                <ProfileRow 
                  label="Đổi mật khẩu" 
                  value="********" 
                  icon={Lock} 
                  onClick={() => {
                    setEditingField('password');
                    setFormData({ ...formData, oldPassword: '', newPassword: '', confirmPassword: '' });
                  }} 
                />
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'address' && (
        <div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4">Địa chỉ của tôi</h3>
          <AddressManager />
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={editingField !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setEditingField(null);
            setIsWaitingVerification(false);
          }
        }}
      >
        <DialogContent className="rounded-[2.5rem] max-w-md border-none p-8">
          {isWaitingVerification ? (
            <div className="py-8 flex flex-col items-center text-center space-y-6">
              <DialogHeader className="sr-only">
                <DialogTitle>Xác thực Email</DialogTitle>
              </DialogHeader>
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900">Đang chờ xác thực</h3>
                <p className="text-gray-500 text-sm leading-relaxed px-4">
                  Chúng tôi đã gửi một liên kết xác thực đến <span className="font-bold text-gray-900">{formData.email}</span>.
                  Hồ sơ sẽ tự động cập nhật ngay khi bạn xác thực thành công.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 text-left">
                <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  Đừng đóng trình duyệt này. Hệ thống sẽ tự động chuyển hướng khi hoàn tất.
                </p>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-gray-900">
                  {editingField === 'fullName' ? 'Cập nhật Họ và tên' : 
                   editingField === 'phone' ? 'Cập nhật Số điện thoại' : 
                   editingField === 'password' ? 'Thay đổi mật khẩu' :
                   'Cập nhật Email'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-6">
                {editingField === 'password' ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Mật khẩu hiện tại</Label>
                      <Input 
                        type="password"
                        value={formData.oldPassword} 
                        onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                        className={`rounded-2xl border-gray-100 h-14 font-bold ${errors.oldPassword ? 'border-red-500' : ''}`} 
                      />
                      {errors.oldPassword && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.oldPassword}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Mật khẩu mới</Label>
                      <Input 
                        type="password"
                        value={formData.newPassword} 
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        className={`rounded-2xl border-gray-100 h-14 font-bold ${errors.newPassword ? 'border-red-500' : ''}`} 
                      />
                      {errors.newPassword && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.newPassword}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Xác nhận mật khẩu mới</Label>
                      <Input 
                        type="password"
                        value={formData.confirmPassword} 
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className={`rounded-2xl border-gray-100 h-14 font-bold ${errors.confirmPassword ? 'border-red-500' : ''}`} 
                      />
                      {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                      {editingField === 'fullName' ? 'Họ và tên mới' : 
                       editingField === 'phone' ? 'Số điện thoại mới' : 
                       'Địa chỉ Email mới'}
                    </Label>
                    <Input 
                      value={editingField === 'fullName' ? formData.fullName : 
                             editingField === 'phone' ? formData.phone : 
                             formData.email} 
                      onChange={(e) => {
                        if (editingField === 'fullName') setFormData({...formData, fullName: e.target.value});
                        if (editingField === 'phone') setFormData({...formData, phone: e.target.value});
                        if (editingField === 'email') setFormData({...formData, email: e.target.value});
                        setErrors({});
                      }}
                      className={`rounded-2xl border-gray-100 h-14 font-bold text-gray-900 focus-visible:ring-green-500/20 ${
                        (editingField === 'fullName' && errors.fullName) || 
                        (editingField === 'phone' && errors.phone) || 
                        (editingField === 'email' && errors.email) ? 'border-red-500 focus-visible:ring-red-500/20' : ''
                      }`} 
                    />
                    {editingField === 'fullName' && errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase">{errors.fullName}</p>}
                    {editingField === 'phone' && errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase">{errors.phone}</p>}
                    {editingField === 'email' && errors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase">{errors.email}</p>}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleUpdate} 
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl h-14 font-black uppercase tracking-widest shadow-lg shadow-green-500/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cập nhật ngay'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Avatar Crop Dialog (giữ nguyên logic cũ nhưng cập nhật style) */}
      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-md border-none p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900">Cắt ảnh đại diện</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            {avatarFile && (
              <ImageCrop file={avatarFile} aspect={1} onCrop={setCroppedAvatar}>
                <ImageCropContent className="max-w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100" />
                <div className="mt-4 flex justify-center gap-4">
                  <ImageCropReset className="rounded-xl hover:bg-gray-100" />
                  <ImageCropApply className="rounded-xl bg-green-500 text-white hover:bg-green-600" />
                </div>
              </ImageCrop>
            )}
            {croppedAvatar && (
              <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Xem trước</span>
                <div className="p-1 bg-white rounded-2xl shadow-md border border-gray-50">
                  <img src={croppedAvatar} alt="Cropped" className="w-24 h-24 rounded-xl object-cover" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => croppedAvatar && uploadAvatar(croppedAvatar)} 
              disabled={!croppedAvatar || loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl h-12 font-black uppercase tracking-widest"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu ảnh đại diện'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
