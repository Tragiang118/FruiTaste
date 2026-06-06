'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Home, Briefcase, Loader2, Check, Pencil } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from '@/lib/axios';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AddressManager() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDeleteId, setAddressToDeleteId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    fullAddress: '',
    isDefault: false
  });

  const [errors, setErrors] = useState<any>({});

  const validate = (data: any) => {
    const newErrors: any = {};
    
    // Validate Họ và tên
    if (!data.recipientName.trim()) {
      newErrors.recipientName = 'Họ và tên không được bỏ trống';
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(data.recipientName)) {
      newErrors.recipientName = 'Họ và tên không được chứa ký tự đặc biệt';
    } else if (data.recipientName.replace(/\s/g, '').length < 2) {
      newErrors.recipientName = 'Họ và tên phải có tối thiểu 2 ký tự';
    } else if (data.recipientName.length > 30){
      newErrors.recipientName = 'Họ và tên phải có tối đa 30 ký tự';
    }

    // Validate Số điện thoại
    if (!data.phone) {
      newErrors.phone = 'Số điện thoại không được bỏ trống';
    } else if (!data.phone.startsWith('0') || data.phone.length < 10 || data.phone.length > 11 || !/^\d+$/.test(data.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!data.fullAddress.trim()) {
      newErrors.fullAddress = 'Địa chỉ không được bỏ trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/users/profile/addresses');
      setAddresses(res.data);
    } catch (error) {
      console.error('Fetch addresses failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ recipientName: '', phone: '', fullAddress: '', isDefault: false });
    setErrors({});
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: any) => {
    setFormData({
      recipientName: addr.recipientName,
      phone: addr.phone,
      fullAddress: addr.fullAddress,
      isDefault: addr.isDefault
    });
    setEditingId(addr.id);
    setErrors({});
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!validate(formData)) return;
    
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.patch(`/users/profile/addresses/${editingId}`, formData);
        toast.success('Cập nhật địa chỉ thành công!');
      } else {
        await api.post('/users/profile/addresses', formData);
        toast.success('Thêm địa chỉ thành công!');
      }
      await fetchAddresses();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setAddressToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!addressToDeleteId) return;
    try {
      await api.delete(`/users/profile/addresses/${addressToDeleteId}`);
      setAddresses(addresses.filter(a => a.id !== addressToDeleteId));
      toast.success('Đã xóa địa chỉ.');
    } catch (error) {
      toast.error('Xóa địa chỉ thất bại.');
    } finally {
      setIsDeleteDialogOpen(false);
      setAddressToDeleteId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.patch(`/users/profile/addresses/${id}/default`);
      await fetchAddresses();
      toast.success('Đã đặt làm địa chỉ mặc định.');
    } catch (error) {
      toast.error('Thao tác thất bại.');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Địa chỉ của tôi</h3>
            <p className="text-xs text-gray-400 font-medium">Tối đa 5 địa chỉ nhận hàng</p>
          </div>
        </div>

        {addresses.length < 5 && (
          <Button 
            onClick={handleOpenAdd}
            className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-6 font-bold flex gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Bạn chưa có địa chỉ nào lưu lại.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div key={addr.id} className={`p-6 rounded-3xl border transition-all flex flex-col gap-4 ${addr.isDefault ? 'border-green-200 bg-green-50/20' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{addr.recipientName}</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">{addr.phone}</p>
                </div>
                <div className="flex gap-1">
                   {!addr.isDefault && (
                     <button 
                        onClick={() => handleSetDefault(addr.id)}
                        className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all"
                        title="Đặt làm mặc định"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                   )}
                   <button 
                      onClick={() => handleOpenEdit(addr)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                      title="Sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                   <button 
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{addr.fullAddress}</p>
              {addr.isDefault && (
                <div className="mt-auto">
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Địa chỉ mặc định</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Shared Dialog for Add/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-3xl border-none p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{isEditing ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Tên người nhận</Label>
                <Input 
                  value={formData.recipientName}
                  onChange={(e) => {
                    setFormData({...formData, recipientName: e.target.value});
                    if (errors.recipientName) setErrors({...errors, recipientName: null});
                  }}
                  className={`rounded-2xl border-gray-100 h-12 ${errors.recipientName ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="VD: Nguyễn Văn A"
                />
                {errors.recipientName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.recipientName}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Số điện thoại</Label>
                <Input 
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({...formData, phone: e.target.value});
                    if (errors.phone) setErrors({...errors, phone: null});
                  }}
                  className={`rounded-2xl border-gray-100 h-12 ${errors.phone ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="VD: 0987654321"
                />
                {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phone}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Địa chỉ chi tiết</Label>
              <Input 
                value={formData.fullAddress}
                onChange={(e) => {
                  setFormData({...formData, fullAddress: e.target.value});
                  if (errors.fullAddress) setErrors({...errors, fullAddress: null});
                }}
                className={`rounded-2xl border-gray-100 h-12 ${errors.fullAddress ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                placeholder="Số nhà, tên đường, phường/xã..."
              />
              {errors.fullAddress && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.fullAddress}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-end pb-2">
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                      className="w-5 h-5 rounded-lg border-gray-200 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Đặt làm mặc định</span>
                 </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 rounded-2xl h-12 font-black uppercase tracking-widest shadow-lg shadow-green-100"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? 'Cập nhật' : 'Lưu địa chỉ')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa địa chỉ?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Địa chỉ này sẽ bị xóa khỏi danh sách của bạn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Xóa địa chỉ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
