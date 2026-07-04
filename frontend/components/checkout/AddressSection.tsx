'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, ChevronRight, Home, Briefcase, Plus, Loader2, X, Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

interface AddressSectionProps {
  onAddressChange: (address: any) => void;
  selectedId?: number;
}

export default function AddressSection({ onAddressChange, selectedId }: AddressSectionProps) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isChanging, setIsChanging] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDeleteId, setAddressToDeleteId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    fullAddress: '',
    label: 'Nhà riêng',
    isDefault: false
  });

  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};
    
    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Họ và tên không được bỏ trống';
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(formData.recipientName)) {
      newErrors.recipientName = 'Họ và tên không được chứa ký tự đặc biệt';
    } else if (formData.recipientName.replace(/\s/g, '').length > 30 || formData.recipientName.replace(/\s/g, '').length < 2) {
      newErrors.recipientName = 'Họ và tên phải có từ 2 đến 30 ký tự ';
    }

    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại không được bỏ trống';
    } else if (!formData.phone.startsWith('0')) {
      newErrors.phone = 'Số điện thoại phải bắt đầu bằng 0';
    } else if (formData.phone.length < 10 || formData.phone.length > 11 || !/^\d+$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.fullAddress.trim()) {
      newErrors.fullAddress = 'Địa chỉ không được bỏ trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/users/profile/addresses');
      setAddresses(res.data);
      
      if (!selectedId && res.data.length > 0) {
        const defaultAddr = res.data.find((a: any) => a.isDefault) || res.data[0];
        onAddressChange(defaultAddr);
      }
    } catch (error) {
      console.error('Fetch addresses failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const selectedAddress = addresses.find(a => a.id === selectedId) || addresses.find(a => a.isDefault) || addresses[0];

  const handleSelect = (addrId: string) => {
    const addr = addresses.find(a => a.id.toString() === addrId);
    if (addr) {
      onAddressChange(addr);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ recipientName: '', phone: '', fullAddress: '', label: 'Nhà riêng', isDefault: false });
    setErrors({});
    setIsEditing(false);
    setIsAdding(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, addr: any) => {
    e.stopPropagation();
    setFormData({
      recipientName: addr.recipientName,
      phone: addr.phone,
      fullAddress: addr.fullAddress,
      label: addr.label,
      isDefault: addr.isDefault
    });
    setEditingId(addr.id);
    setErrors({});
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
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

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.patch(`/users/profile/addresses/${editingId}`, formData);
        toast.success('Cập nhật địa chỉ thành công!');
      } else {
        const res = await api.post('/users/profile/addresses', formData);
        onAddressChange(res.data);
        toast.success('Thêm địa chỉ thành công!');
      }
      await fetchAddresses();
      setIsAdding(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex items-center justify-center min-h-[120px]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-orange-400 via-primary to-green-500 w-full" />
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-gray-900">Địa chỉ nhận hàng</h3>
        </div>

        {selectedAddress ? (
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{selectedAddress.recipientName}</span>
                <span className="text-gray-400 font-medium">|</span>
                <span className="font-medium text-gray-700">{selectedAddress.phone}</span>
                {selectedAddress.label && (
                   <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                    {selectedAddress.label === 'Nhà riêng' ? <Home size={10}/> : <Briefcase size={10}/>} {selectedAddress.label}
                 </span>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{selectedAddress.fullAddress}</p>
            </div>
            
            <button 
              onClick={() => setIsChanging(true)}
              className="text-primary font-bold text-sm uppercase tracking-wider hover:underline"
            >
              Thay đổi
            </button>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-gray-400 mb-4">Bạn chưa có địa chỉ nhận hàng nào.</p>
            <Button onClick={() => setIsAdding(true)} className="rounded-full bg-primary hover:bg-green-600">
              <Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ mới
            </Button>
          </div>
        )}
      </div>

      {/* Modal Chọn địa chỉ */}
      <Dialog open={isChanging} onOpenChange={setIsChanging}>
        <DialogContent className="rounded-[2rem] border-none p-0 max-w-[450px] bg-white overflow-hidden shadow-2xl">
          <div className="p-6 pb-0">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black text-gray-900">Địa chỉ của tôi</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
              <RadioGroup 
                value={selectedId?.toString()} 
                onValueChange={handleSelect}
                className="space-y-4"
              >
                {addresses.map((addr) => (
                  <div 
                    key={addr.id} 
                    className={`relative p-4 rounded-2xl border-2 transition-all group cursor-pointer ${selectedId === addr.id ? 'border-black bg-[#F6FBF6]' : 'border-gray-50 bg-white hover:border-gray-100'}`}
                    onClick={() => handleSelect(addr.id.toString())}
                  >
                    <div className="flex gap-3">
                      <RadioGroupItem 
                        value={addr.id.toString()} 
                        id={`addr-${addr.id}`}
                        className="mt-1 h-5 w-5 border-2 data-[state=checked]:bg-black data-[state=checked]:border-black"
                      />
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-black text-base text-gray-900">{addr.recipientName}</span>
                          <span className="text-gray-300 font-bold">|</span>
                          <span className="text-gray-600 font-bold text-sm">{addr.phone}</span>
                          {addr.isDefault && (
                            <span className="text-[9px] text-gray-900 font-black border border-gray-400 px-1.5 py-0.5 rounded ml-auto">MẶC ĐỊNH</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{addr.fullAddress}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] bg-gray-100 text-gray-400 px-3 py-0.5 rounded-full font-black uppercase tracking-widest">
                            {addr.label}
                          </span>
                          <div className="flex gap-2">
                             <button 
                               onClick={(e) => handleOpenEdit(e, addr)}
                               className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                               title="Sửa"
                             >
                               <Pencil size={14} />
                             </button>
                             <button 
                               onClick={(e) => handleDelete(e, addr.id)}
                               className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                               title="Xóa"
                             >
                               <Trash2 size={14} />
                             </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              {addresses.length < 5 && (
                <button 
                  className="w-full rounded-2xl h-16 border-dashed border-2 border-gray-200 hover:border-primary hover:bg-green-50 text-gray-400 hover:text-primary transition-all flex items-center justify-center gap-2 font-bold text-base"
                  onClick={() => {
                    setIsChanging(false);
                    setTimeout(() => handleOpenAdd(), 200);
                  }}
                >
                  <Plus size={18} className="stroke-[3px]" /> Thêm địa chỉ mới
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 bg-gray-50 p-6">
            <Button 
              onClick={() => setIsChanging(false)} 
              className="w-full bg-[#111827] hover:bg-black text-white rounded-xl h-12 text-base font-black uppercase tracking-[0.1em]"
            >
              Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="rounded-[2.5rem] border-none p-0 overflow-hidden max-w-md bg-white shadow-2xl animate-in zoom-in-95 duration-200">
          <DialogHeader className="p-8 border-b border-gray-100 bg-white space-y-1">
            <DialogTitle className="text-sm font-bold text-gray-700 ml-1">{isEditing ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</DialogTitle>
            <p className="text-sm text-gray-500 mt-1 font-medium ml-1">
              {isEditing ? 'Cập nhật thông tin chi tiết địa chỉ nhận hàng của bạn.' : 'Thêm địa chỉ mới để nhận hàng từ cửa hàng.'}
            </p>
          </DialogHeader>

          <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto bg-gray-50/30">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Tên người nhận (*)</Label>
                <Input 
                  value={formData.recipientName}
                  onChange={(e) => {
                    setFormData({...formData, recipientName: e.target.value});
                    if (errors.recipientName) setErrors({...errors, recipientName: null});
                  }}
                  className={`rounded-2xl border-gray-100 h-9 bg-white font-bold text-[13px] focus:border-primary focus:ring-primary/20 ${errors.recipientName ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="VD: Nguyễn Văn A"
                />
                {errors.recipientName && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.recipientName}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Số điện thoại (*)</Label>
                <Input 
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({...formData, phone: e.target.value});
                    if (errors.phone) setErrors({...errors, phone: null});
                  }}
                  className={`rounded-2xl border-gray-100 h-9 bg-white font-bold text-[13px] focus:border-primary focus:ring-primary/20 ${errors.phone ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="VD: 0987654321"
                />
                {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.phone}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Địa chỉ chi tiết (*)</Label>
              <Input 
                value={formData.fullAddress}
                onChange={(e) => {
                  setFormData({...formData, fullAddress: e.target.value});
                  if (errors.fullAddress) setErrors({...errors, fullAddress: null});
                }}
                className={`rounded-2xl border-gray-100 h-9 bg-white font-bold text-[13px] focus:border-primary focus:ring-primary/20 ${errors.fullAddress ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                placeholder="Số nhà, tên đường, phường/xã..."
              />
              {errors.fullAddress && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.fullAddress}</p>}
            </div>
 
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Loại địa chỉ</Label>
                <Select 
                  value={formData.label} 
                  onValueChange={(val) => setFormData({...formData, label: val})}
                >
                  <SelectTrigger className="rounded-2xl border-gray-100 h-9 bg-white font-bold text-[13px] text-gray-700 transition-all cursor-pointer shadow-none">
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-2 bg-white min-w-[150px]">
                    <SelectItem value="Nhà riêng" className="cursor-pointer rounded-xl font-bold p-2 text-xs focus:bg-primary/5 focus:text-primary">Nhà riêng</SelectItem>
                    <SelectItem value="Văn phòng" className="cursor-pointer rounded-xl font-bold p-2 text-xs focus:bg-primary/5 focus:text-primary">Văn phòng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-2 ml-1">
                 <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                        className="peer w-4 h-4 opacity-0 absolute cursor-pointer"
                      />
                      <div className="w-4 h-4 rounded border-2 border-gray-200 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                        <Check size={10} className="text-white scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Mặc định</span>
                 </label>
              </div>
            </div>
          </div>
          <div className="p-8 border-t border-gray-100 flex justify-end gap-3 bg-white">
            <Button 
              variant="ghost" 
              onClick={() => setIsAdding(false)} 
              className="rounded-full px-6 cursor-pointer font-bold h-8 text-xs"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="rounded-full bg-primary text-white px-6 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer h-8 font-black uppercase tracking-widest text-[9px]"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xác nhận'}
            </Button>
          </div>
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

function Check({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
