"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PlusCircle, X, ChevronDown } from "lucide-react";

export default function AddUserDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const methods = useForm({
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      phone: "",
      avatar: "",
      role: "USER",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const avatarValue = watch("avatar");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("avatar", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await api.post("/users", data);
      toast.success("Thêm người dùng thành công!");
      setOpen(false);
      reset();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi khi thêm người dùng!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-[#1a1a1a] text-white rounded-full px-5 shadow-lg shadow-black/10 hover:scale-[1.02] transition-all cursor-pointer h-8 font-bold text-xs"
        >
          <PlusCircle className="mr-2 h-3.5 w-3.5" />
          Thêm mới
        </Button>
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-md w-full rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl" showCloseButton={false}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-gray-700 ml-1">Thêm người dùng mới</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">Tạo tài khoản mới cho hệ thống FruiTaste.</DialogDescription>
          </DialogHeader>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full h-8 w-8">
            <X size={18} />
          </Button>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 bg-white">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Thông tin đăng nhập (*)</label>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Input 
                      {...register("email", { required: "Bắt buộc nhập email" })} 
                      placeholder="Email đăng nhập" 
                      className={cn("rounded-2xl border-gray-100 h-11 text-[13px] font-medium", errors.email && "border-red-500")}
                    />
                    {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-2">{errors.email.message as string}</p>}
                  </div>
                  <div>
                    <Input 
                      type="password" 
                      {...register("password", { 
                        required: "Bắt buộc nhập mật khẩu", 
                        minLength: { value: 6, message: "Tối thiểu 6 ký tự" } 
                      })} 
                      placeholder="Mật khẩu" 
                      className={cn("rounded-2xl border-gray-100 h-11 text-[13px] font-medium", errors.password && "border-red-500")}
                    />
                    {errors.password && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-2">{errors.password.message as string}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Thông tin cá nhân (*)</label>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Input 
                      {...register("fullName", { required: "Bắt buộc nhập họ tên" })} 
                      placeholder="Họ và tên" 
                      className={cn("rounded-2xl border-gray-100 h-11 text-[13px] font-medium", errors.fullName && "border-red-500")}
                    />
                    {errors.fullName && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-2">{errors.fullName.message as string}</p>}
                  </div>
                  <div>
                    <Input 
                      {...register("phone", { required: "Bắt buộc nhập số điện thoại" })} 
                      placeholder="Số điện thoại" 
                      className={cn("rounded-2xl border-gray-100 h-11 text-[13px] font-medium", errors.phone && "border-red-500")}
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-2">{errors.phone.message as string}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Vai trò hệ thống (*)</label>
                <Select 
                  value={watch("role")} 
                  onValueChange={(val) => setValue("role", val)}
                >
                  <SelectTrigger className="h-11 w-full rounded-2xl border border-gray-100 bg-white px-4 text-[13px] font-bold text-gray-700 transition-all cursor-pointer shadow-none">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-2 bg-white min-w-[200px]">
                    <SelectGroup>
                      <SelectLabel className="text-sm font-bold text-gray-700 ml-1">Chọn vai trò</SelectLabel>
                      <SelectSeparator className="my-1 bg-gray-50" />
                      <SelectItem value="USER" className="cursor-pointer rounded-xl font-bold p-2 text-xs focus:bg-primary/5 focus:text-primary">
                        Người dùng (USER)
                      </SelectItem>
                      <SelectItem value="ADMIN" className="cursor-pointer rounded-xl font-bold p-2 text-xs focus:bg-primary/5 focus:text-primary text-purple-600">
                        Quản trị viên (ADMIN)
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Ảnh đại diện (Tùy chọn)</label>
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center bg-gray-50/50 overflow-hidden shrink-0 group hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    {avatarValue ? (
                      <img src={avatarValue} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-300 group-hover:text-primary/50 transition-colors">
                        <PlusCircle size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 leading-tight">Nhấp vào ô vuông để tải ảnh lên hoặc dán link ảnh vào bên dưới.</p>
                    <Input 
                      {...register("avatar")} 
                      placeholder="Dán link ảnh (https://...)" 
                      className="rounded-xl border-gray-100 h-9 bg-white text-[12px] font-bold"
                    />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 -mx-6 px-6 bg-gray-50/50 mt-6">
              <Button type="button" variant="ghost" className="rounded-full px-6 font-bold text-gray-500" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" className="rounded-full bg-[#1a1a1a] text-white px-8 shadow-lg shadow-black/10 hover:scale-[1.02] transition-all font-bold" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Thêm mới"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
