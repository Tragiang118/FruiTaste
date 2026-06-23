'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Edit2, Trash2, Tag, BookOpen, MoreHorizontal, RefreshCw, Edit, ArrowUpDown, Layers, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { cn, getImageUrl } from "@/lib/utils";
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { ImageCrop, ImageCropContent, ImageCropApply, ImageCropReset } from '@/components/ui/image-crop';

interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Bỏ sorting theo ID, chỉ giữ sorting mặc định từ A-Z cho Danh mục

  // States for adding / editing modal logic
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Partial<Category>>({ name: '', description: '', imageUrl: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadCategoryImage = async (base64Image: string) => {
    setIsUploading(true);
    try {
      const res = await fetch(base64Image);
      const blob = await res.blob();
      const file = new File([blob], 'category.png', { type: 'image/png' });

      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/upload/category', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setEditingCat(prev => ({ ...prev, imageUrl: uploadRes.data.imageUrl }));
      toast.success('Tải ảnh lên thành công!');
      setIsCropModalOpen(false);
      setCropFile(null);
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Tải ảnh lên thất bại.');
    } finally {
      setIsUploading(false);
    }
  };

  // State for confirm delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Lỗi khi tải danh mục', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setErrors({});
    setEditingCat({ name: '', description: '', imageUrl: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setErrors({});
    setEditingCat(cat);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async () => {
    const newErrors: Record<string, string> = {};
    if (!editingCat.name?.trim()) newErrors.name = 'Tên danh mục không được để trống';
    if (!editingCat.description?.trim()) newErrors.description = 'Mô tả không được để trống';
    if (!editingCat.imageUrl) newErrors.imageUrl = 'Hình ảnh danh mục là bắt buộc';

    if (editingCat.description && editingCat.description.length > 300) {
      newErrors.description = 'Mô tả không được vượt quá 300 ký tự';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
    }

    setErrors({});
    try {
      const payload = {
        name: editingCat.name,
        description: editingCat.description,
        imageUrl: editingCat.imageUrl
      };

      if (editingCat.id) {
        await api.put(`/categories/${editingCat.id}`, payload);
        toast.success('Cập nhật thành công');
      } else {
        await api.post('/categories', payload);
        toast.success('Thêm mới thành công');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error('Có lỗi khi lưu! Hãy kiểm tra log server.');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Xóa thành công');
      fetchCategories();
    } catch (err: any) {
      toast.error('Không thể xóa. Có thể đang có sản phẩm dùng danh mục này.');
      console.error(err?.response?.data || err);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.description?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    // Sắp xếp Danh mục từ A-Z
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="p-6 md:p-8 space-y-6 w-full h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Quản lý Danh mục
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchCategories} variant="outline" className="bg-white rounded-full text-gray-700 cursor-pointer border-gray-200 h-8 px-4 text-xs font-bold shadow-none">
            <RefreshCw className={cn("mr-2 h-3.5 w-3.5 text-gray-500", loading && "animate-spin")} /> Làm mới
          </Button>
          <Button onClick={openAddModal} className="bg-[#1a1a1a] text-white rounded-full px-5 shadow-lg shadow-black/10 hover:scale-[1.02] transition-all cursor-pointer h-8 font-bold text-xs">
            <PlusCircle className="mr-2 h-3.5 w-3.5" />
            Thêm mới
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <CardHeader className="border-b border-gray-50 bg-white p-4">
           <div className="relative max-w-md w-full">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
             <Input 
               placeholder="Tra cứu tên thư mục hoặc mô tả..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="pl-9 rounded-full bg-gray-50 border-gray-100"
             />
           </div>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 overflow-x-auto">
          {loading ? (
             <div className="flex justify-center items-center h-40 text-gray-400">Đang tải cấu trúc danh mục...</div>
          ) : (
             <Table>
               <TableHeader className="bg-gray-50/50">
                 <TableRow className="border-gray-50">
                   <TableHead className="w-24 text-center font-bold text-gray-700">ID</TableHead>
                    <TableHead className="w-20 font-bold text-gray-700">Ảnh</TableHead>
                   <TableHead className="w-1/3 font-bold text-gray-700">Danh mục</TableHead>
                   <TableHead className="font-bold text-gray-700">Mô tả</TableHead>
                   <TableHead className="w-24 text-right font-bold text-gray-700">Thao tác</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                        Chưa có thư mục nào
                      </TableCell>
                    </TableRow>
                 ) : filteredCategories.map((c) => (
                   <TableRow key={c.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors group">
                     <TableCell className="text-center font-medium text-gray-500">{c.id}</TableCell>
                      <TableCell>
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                          {c.imageUrl ? (
                            <img src={getImageUrl(c.imageUrl)} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Tag className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                     <TableCell className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                       <div className="flex items-center gap-2">
                         <Tag className="w-4 h-4 text-gray-400" />
                         {c.name}
                       </div>
                     </TableCell>
                     <TableCell className="text-gray-600 max-w-sm truncate">
                       <div className="flex items-start gap-2">
                         <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                         <span className="truncate">{c.description || <i className="text-gray-400">Chưa cập nhật mô tả...</i>}</span>
                       </div>
                     </TableCell>
                     <TableCell className="text-right">
                       <div className="flex justify-end gap-1 transition-opacity">
                         <Button variant="ghost" size="icon" onClick={() => openEditModal(c)} className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer" title="Sửa thông tin danh mục">
                           <Edit size={16} />
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => setConfirmDeleteId(c.id)}
                           className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                           title="Xóa danh mục"
                         >
                           <Trash2 size={16} />
                         </Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-gray-700 ml-1">{editingCat.id ? 'Sửa thông tin' : 'Tạo mới danh mục'}</h2>
                <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin nhận diện hệ thống danh mục.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                <X size={18} />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Danh mục (*)</label>
                <Input 
                  placeholder="VD: Trái Cây Nhập Khẩu..." 
                  value={editingCat.name} 
                  onChange={e => {
                    setEditingCat({...editingCat, name: e.target.value});
                    if (errors.name) setErrors(prev => ({...prev, name: ''}));
                  }} 
                  className={`rounded-2xl border-gray-100 h-10 bg-white font-bold text-[13px] ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-[9px] font-bold uppercase ml-2 mt-1">{errors.name}</p>}
              </div>
              <Field className="space-y-2">
                <FieldLabel className="text-sm font-bold text-gray-700 ml-1">Mô tả (*)</FieldLabel>
                <Textarea 
                  className={cn(
                    "rounded-2xl border-gray-100 min-h-[100px] leading-relaxed p-4 bg-gray-50/30",
                    ((editingCat.description?.length || 0) > 300 || errors.description) && "border-red-500 focus-visible:ring-red-500/20"
                  )}
                  placeholder="Ghi chú thêm về mảng kinh doanh (SEO Friendly)..."
                  value={editingCat.description || ''}
                  onChange={e => {
                    setEditingCat({...editingCat, description: e.target.value});
                    if (errors.description) setErrors(prev => ({...prev, description: ''}));
                  }}
                />
                {errors.description && <p className="text-red-500 text-[9px] font-bold uppercase ml-2 mt-1">{errors.description}</p>}
                <FieldDescription className={cn(
                  "text-[10px] font-bold uppercase tracking-wider flex justify-end items-center px-1 mt-1",
                  (editingCat.description?.length || 0) > 300 ? "text-red-500" : "text-gray-400"
                )}>
                  <span className={cn(
                    "px-2 py-1 rounded-lg border transition-colors",
                    (editingCat.description?.length || 0) > 300 
                      ? "bg-red-50 border-red-200 text-red-600" 
                      : "bg-gray-50 border-gray-100 text-gray-500"
                  )}>
                    {editingCat.description?.length || 0} {" / 300 ký tự"}
                  </span>
                </FieldDescription>
              </Field>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Hình ảnh danh mục (*)</label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center bg-gray-50/50 overflow-hidden shrink-0 group hover:border-primary/50 transition-colors cursor-pointer",
                      errors.imageUrl ? "border-red-500 bg-red-50/30" : "border-gray-100"
                    )}>
                      {editingCat.imageUrl ? (
                        <img src={getImageUrl(editingCat.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-300 group-hover:text-primary/50 transition-colors">
                          <PlusCircle size={20} />
                        </div>
                      )}
                    </div>
                    <input 
                      id="cat-image-upload"
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('Hình ảnh vượt quá dung lượng giới hạn (tối đa 5MB)');
                            return;
                          }
                          setCropFile(file);
                          setIsCropModalOpen(true);
                        }
                        e.target.value = '';
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-[11px] font-bold text-gray-400">Bạn có thể tải ảnh lên, hoặc dán link ảnh trực tiếp vào bên dưới.</p>
                    <Input 
                      placeholder="Dán link ảnh tại đây (https://...)" 
                      value={editingCat.imageUrl || ''} 
                      onChange={e => {
                        setEditingCat({...editingCat, imageUrl: e.target.value});
                        if (errors.imageUrl) setErrors(prev => ({...prev, imageUrl: ''}));
                      }} 
                      className={cn(
                        "rounded-xl border-gray-100 h-10 bg-white text-[12px] font-bold",
                        errors.imageUrl && "border-red-500"
                      )} 
                    />
                  </div>
                </div>
                {errors.imageUrl && <p className="text-red-500 text-[9px] font-bold uppercase ml-2 mt-1">{errors.imageUrl}</p>}
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-full">Hủy</Button>
              <Button onClick={handleSaveCategory} className="rounded-full bg-primary text-white">Xác nhận</Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-gray-700 ml-1">Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Bạn có chắc chắn muốn xóa danh mục này không? Việc này có thể ảnh hưởng đến các sản phẩm đang sử dụng danh mục. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-gray-200 cursor-pointer">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)} className="rounded-full bg-red-500 hover:bg-red-600 text-white cursor-pointer">
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Crop Modal Integration */}
      {isCropModalOpen && cropFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-gray-700 ml-1 mb-6 flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <ImageIcon size={20} />
              </div>
              Căn chỉnh hình ảnh
            </h3>

            <div className="flex flex-col items-center gap-6">
              <ImageCrop
                file={cropFile}
                aspect={1}
                onCrop={(cropped) => {
                  uploadCategoryImage(cropped);
                }}
              >
                <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 max-h-[400px]">
                  <ImageCropContent className="max-w-full" />
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsCropModalOpen(false)}
                    className="rounded-full px-8 font-bold text-xs h-9 border-gray-200"
                  >
                    Hủy bỏ
                  </Button>
                  <div className="flex gap-2">
                    <ImageCropReset className="h-9 w-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200" />
                    <ImageCropApply
                      disabled={isUploading}
                      className="h-9 w-9 rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 flex items-center justify-center p-0"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <ImageIcon size={16} />}
                    </ImageCropApply>
                  </div>
                </div>
              </ImageCrop>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}