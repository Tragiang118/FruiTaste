'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/RichTextEditor';

import { Search, Edit, Tag, Image as ImageIcon, Filter, ArrowUpDown, ChevronDown, RefreshCw, PlusCircle, Package, ArrowUpRight, Trash2, X, GripVertical, Film } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { cn, getImageUrl } from "@/lib/utils";
import { ImageCrop, ImageCropContent, ImageCropApply, ImageCropReset } from "@/components/ui/image-crop";
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

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  stockQuantity: number;
  mediaUrls: string[];
  isActive: boolean;
  categories: { id: number; name: string }[];
  description?: string;
  healthInfo?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState<number | 'ALL'>('ALL');

  // Sort states
  const [nameSort, setNameSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');
  const [priceSort, setPriceSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');
  const [stockSort, setStockSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    unit: '',
    stockQuantity: 0,
    mediaUrls: [],
    isActive: true,
    categories: [],
    description: '',
    healthInfo: ''
  });
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const isVideoUrl = (url: string) => /\.(mp4|webm)$/i.test(url.split(/[?#]/)[0]);

  const uploadProductMedia = async (base64OrFile: string | File) => {
    setIsUploading(true);
    try {
      let file: File;
      if (typeof base64OrFile === 'string') {
        const res = await fetch(base64OrFile);
        const blob = await res.blob();
        file = new File([blob], 'product.png', { type: 'image/png' });
      } else {
        file = base64OrFile;
      }

      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/upload/product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newUrl = uploadRes.data.url;
      setEditingProduct(prev => ({
        ...prev,
        mediaUrls: [...(prev.mediaUrls || []), newUrl]
      }));
      toast.success('Tải lên thành công!');
      setIsCropModalOpen(false);
      setCropFile(null);
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Tải lên thất bại.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setEditingProduct(prev => ({
      ...prev,
      mediaUrls: (prev.mediaUrls || []).filter((_, i) => i !== index)
    }));
  };

  const handleDragStart = (index: number) => setDragIdx(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === index) return;
    const urls = [...(editingProduct.mediaUrls || [])];
    const [moved] = urls.splice(dragIdx, 1);
    urls.splice(index, 0, moved);
    setEditingProduct(prev => ({ ...prev, mediaUrls: urls }));
    setDragIdx(index);
  };
  const handleDragEnd = () => setDragIdx(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video vượt quá dung lượng giới hạn (tối đa 100MB)');
        e.target.value = '';
        return;
      }
      uploadProductMedia(file);
    }
    e.target.value = '';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products/admin'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setErrors({});
    setEditingProduct({
      name: '',
      price: 10000,
      unit: 'kg',
      stockQuantity: 0,
      mediaUrls: [],
      isActive: true,
      categories: [],
      description: '',
      healthInfo: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setErrors({});
    setEditingProduct({ ...prod });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async () => {
    const newErrors: Record<string, string> = {};
    if (!editingProduct.name?.trim()) newErrors.name = 'Tên không được để trống';
    if ((editingProduct.price as any) === '' || editingProduct.price === undefined) {
      newErrors.price = 'Giá không được để trống';
    } else if (Number(editingProduct.price) < 1000) {
      newErrors.price = 'Giá phải từ 1,000 VNĐ';
    }

    if (!editingProduct.unit?.trim()) newErrors.unit = 'Đơn vị không được để trống';


    if (!editingProduct.mediaUrls?.length) {
      newErrors.image = 'Cần ít nhất 1 ảnh hoặc video cho sản phẩm';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        ...editingProduct,
        price: Number(editingProduct.price),
        stockQuantity: Number(editingProduct.stockQuantity),
        mediaUrls: editingProduct.mediaUrls || [],
        categoryIds: editingProduct.categories?.map(c => c.id) || []
      };

      if (editingProduct.id) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await api.post('/products', payload);
        toast.success('Thêm sản phẩm mới thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi lưu sản phẩm');
    }
  };

  const handleUpdateStatus = async (product: Product, newStatus: boolean) => {
    try {
      await api.put(`/products/${product.id}`, { isActive: newStatus });
      toast.success(`Đã ${newStatus ? 'hiển thị' : 'tạm dừng'} sản phẩm`);
      fetchData();
    } catch (error) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success('Đã gỡ bỏ sản phẩm thành công');
      fetchData();
    } catch (error) {
      toast.error('Có lỗi khi xóa sản phẩm');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && p.isActive) ||
      (statusFilter === 'INACTIVE' && !p.isActive);
    const matchesCategory = categoryFilter === 'ALL' || p.categories.some(c => c.id === categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    if (nameSort !== 'NONE') {
      return nameSort === 'ASC' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    if (priceSort !== 'NONE') {
      return priceSort === 'ASC' ? a.price - b.price : b.price - a.price;
    }
    if (stockSort !== 'NONE') {
      return stockSort === 'ASC' ? a.stockQuantity - b.stockQuantity : b.stockQuantity - a.stockQuantity;
    }
    return b.id - a.id;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 w-full h-full overflow-y-auto bg-gray-50/30">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Quản lý Sản phẩm
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Quản lý kho hàng và giá bán sản phẩm.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={fetchData} variant="outline" className="bg-white rounded-full text-gray-700 cursor-pointer border-gray-200 h-8 px-4 text-xs font-bold shadow-none">
            <RefreshCw className={cn("mr-2 h-3.5 w-3.5 text-gray-500", loading && "animate-spin")} /> Làm mới
          </Button>
          <Button onClick={openAddModal} className="bg-primary text-white rounded-full px-5 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer h-8 font-bold text-xs">
            <PlusCircle className="mr-2 h-3.5 w-3.5" />
            Thêm mới
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border-none shadow-sm overflow-hidden flex flex-col bg-white">
        <CardHeader className="border-b border-gray-50 p-6 space-y-4 bg-white">
          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full xl:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-full bg-gray-50/50 border-gray-200 h-8 text-[13px] shadow-none font-medium focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300 hover:border-gray-300 transition-colors"
              />
            </div>

            {/* Advanced Filters */}
            <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500 whitespace-nowrap">
                <Filter size={16} /> Lọc theo:
              </div>

              {/* Category Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full border border-gray-200 font-bold text-gray-700 bg-gray-50/50 hover:bg-gray-100 min-w-[140px] justify-between h-8 px-3 text-[13px] shadow-none transition-colors">
                    <Tag size={13} className="mr-2 text-primary/60" />
                    <span className="truncate">{categoryFilter === 'ALL' ? 'Tất cả danh mục' : categories.find(c => c.id === categoryFilter)?.name || 'Danh mục'}</span>
                    <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-40 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-gray-100 p-2 max-h-80 overflow-y-auto bg-white">
                  <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-widest">CHỌN DANH MỤC</DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-gray-50" />
                  <DropdownMenuRadioGroup value={categoryFilter.toString()} onValueChange={(val) => setCategoryFilter(val === 'ALL' ? 'ALL' : Number(val))}>
                    <DropdownMenuRadioItem value="ALL" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Tất cả danh mục</DropdownMenuRadioItem>
                    {categories.map(c => (
                      <DropdownMenuRadioItem key={c.id} value={c.id.toString()} className="cursor-pointer rounded-xl font-bold p-2 text-xs">{c.name}</DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full border border-gray-200 font-bold text-gray-700 bg-gray-50/50 hover:bg-gray-100 min-w-[140px] justify-between h-8 px-3 text-[13px] shadow-none transition-colors">
                    <span>{statusFilter === 'ALL' ? 'Tất cả trạng thái' : statusFilter === 'ACTIVE' ? 'Đang bán' : 'Tạm dừng'}</span>
                    <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-40 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-gray-100 p-2 bg-white">
                  <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-widest">CHỌN TRẠNG THÁI</DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-gray-50" />
                  <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                    <DropdownMenuRadioItem value="ALL" className="cursor-pointer rounded-xl font-bold p-2 text-xs">Tất cả trạng thái</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ACTIVE" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-blue-600">Đang bán</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="INACTIVE" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-gray-400">Tạm dừng</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-60 gap-3 text-gray-400">
              <RefreshCw className="animate-spin w-8 h-8 text-primary" />
              <p className="text-sm font-medium">Đang tải dữ liệu sản phẩm...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-gray-50">
                  <TableHead className="w-16 text-center font-bold text-gray-700">ID</TableHead>
                  <TableHead className="font-bold text-gray-700">
                    <div className="flex items-center gap-1">
                      Sản phẩm
                      <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={() => {
                        setNameSort(nameSort === 'ASC' ? 'DESC' : nameSort === 'DESC' ? 'NONE' : 'ASC');
                        setPriceSort('NONE'); setStockSort('NONE');
                      }}>
                        <ArrowUpDown className={cn("w-3 h-3", nameSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">Danh mục</TableHead>
                  <TableHead className="font-bold text-gray-700 text-right">
                    <div className="flex items-center justify-end gap-1">
                      Giá bán
                      <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={() => {
                        setPriceSort(priceSort === 'ASC' ? 'DESC' : priceSort === 'DESC' ? 'NONE' : 'ASC');
                        setNameSort('NONE'); setStockSort('NONE');
                      }}>
                        <ArrowUpDown className={cn("w-3 h-3", priceSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">
                    <div className="flex items-center justify-center gap-1">
                      Tồn kho
                      <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={() => {
                        setStockSort(stockSort === 'ASC' ? 'DESC' : stockSort === 'DESC' ? 'NONE' : 'ASC');
                        setNameSort('NONE'); setPriceSort('NONE');
                      }}>
                        <ArrowUpDown className={cn("w-3 h-3", stockSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">Trạng thái</TableHead>
                  <TableHead className="w-24 text-center font-bold text-gray-700">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center text-gray-400 font-medium text-sm">
                      Không tìm thấy sản phẩm nào
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.map((p) => (
                  <TableRow key={p.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <TableCell className="text-center font-bold text-gray-400 py-3 text-[13px]">#{p.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-50 flex items-center justify-center group-hover:scale-105 transition-transform shadow-none">
                          {p.mediaUrls?.[0] ? (
                            <img src={getImageUrl(p.mediaUrls[0])} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-primary transition-colors text-[13px]">{p.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{p.unit}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {p.categories?.map(c => (
                          <span key={c.id} className="px-2 py-0.5 rounded-lg bg-green-50 text-green-600 text-[9px] font-bold border border-green-100 uppercase shadow-none">
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-black text-gray-900 text-[13px]">
                      {p.price.toLocaleString('vi-VN')} đ
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                        p.stockQuantity > 0 ? "text-gray-700 bg-gray-50 border-gray-100" : "text-red-500 bg-red-50 border-red-100"
                      )}>
                        {p.stockQuantity > 0 ? p.stockQuantity : 'Hết hàng'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none focus:ring-0">
                          <span className={cn(
                            "inline-flex justify-center items-center px-3 py-1 rounded-full text-[11px] font-bold min-w-[100px] cursor-pointer hover:opacity-80 transition-opacity border",
                            p.isActive ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-gray-100 text-gray-400 border-gray-200"
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full mr-2", p.isActive ? "bg-blue-600" : "bg-gray-400")} />
                            <span className="flex-1 text-center">{p.isActive ? 'Đang bán' : 'Tạm dừng'}</span>
                            <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-50" />
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 rounded-2xl shadow-xl border border-gray-100 p-2 bg-white">
                          <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-widest">CHỌN TRẠNG THÁI</DropdownMenuLabel>
                          <DropdownMenuSeparator className="my-1 bg-gray-50" />
                          <DropdownMenuRadioGroup value={p.isActive ? 'true' : 'false'} onValueChange={(v) => handleUpdateStatus(p, v === 'true')}>
                            <DropdownMenuRadioItem value="true" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-blue-600">Đang bán</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="false" className="cursor-pointer rounded-xl font-bold p-2 text-xs text-gray-400">Tạm dừng</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfirmDeleteId(p.id)}
                          title="Xóa sản phẩm"
                          className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full cursor-pointer transition-all"
                        >
                          <Trash2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(p)}
                          className="h-7 w-7 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full cursor-pointer transition-all"
                        >
                          <Edit size={14} />
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

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="p-8 border-b border-gray-100 bg-white">
              <h2 className="text-sm font-bold text-gray-700 ml-1">{editingProduct.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Cập nhật thông tin chi tiết cho sản phẩm hoa quả.</p>
            </div>
            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto bg-gray-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Tên sản phẩm (*)</label>
                  <Input
                    placeholder="VD: Cam sành Tiền Giang..."
                    value={editingProduct.name || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="rounded-2xl border-gray-100 h-9 bg-white font-bold text-[13px]"
                  />
                  {errors.name && <p className="text-red-500 text-[9px] font-bold uppercase ml-2 mt-1">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Danh mục</label>
                  <Select
                    value={editingProduct.categories?.length ? editingProduct.categories[0].id.toString() : ""}
                    onValueChange={(val) => {
                      const catId = Number(val);
                      const cat = categories.find(c => c.id === catId);
                      if (cat) setEditingProduct({ ...editingProduct, categories: [cat] });
                    }}
                  >
                    <SelectTrigger className="h-9 w-full rounded-2xl border border-gray-100 bg-white px-4 text-[13px] font-bold text-gray-700 transition-all cursor-pointer shadow-none">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-2 bg-white min-w-[200px]">
                      <SelectGroup>
                        <SelectLabel className="text-sm font-bold text-gray-700 ml-1">Chọn danh mục</SelectLabel>
                        <SelectSeparator className="my-1 bg-gray-50" />
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()} className="cursor-pointer rounded-xl font-bold p-2 text-xs focus:bg-primary/5 focus:text-primary">
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-[9px] font-bold uppercase ml-2 mt-1">{errors.category}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Giá (VNĐ) (*)</label>
                  <Input
                    type="text"
                    value={(editingProduct.price as any) !== '' ? Number(editingProduct.price).toLocaleString('vi-VN') : ''}
                    onChange={e => {
                      const val = e.target.value.replace(/\./g, '');
                      if (val === '' || /^\d+$/.test(val)) {
                        setEditingProduct({ ...editingProduct, price: val === '' ? '' as any : Number(val) });
                      }
                    }}
                    className="rounded-2xl border-gray-100 h-9 bg-white font-bold text-primary text-[13px]"
                  />
                  {errors.price && <p className="text-red-500 text-[9px] font-bold uppercase ml-2 mt-1">{errors.price}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Đơn vị (*)</label>
                  <Select
                    value={editingProduct.unit || ''}
                    onValueChange={(val) => setEditingProduct({ ...editingProduct, unit: val })}
                  >
                    <SelectTrigger className="h-9 w-full rounded-2xl border border-gray-100 bg-white px-4 text-[13px] font-bold text-gray-700 transition-all cursor-pointer shadow-none">
                      <SelectValue placeholder="Chọn đơn vị" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-2 bg-white min-w-[200px]">
                      <SelectGroup>
                        <SelectLabel className="text-sm font-bold text-gray-700 ml-1">Chọn đơn vị</SelectLabel>
                        <SelectSeparator className="my-1 bg-gray-50" />
                        <SelectItem value="kg" className="cursor-pointer rounded-xl font-bold p-2 text-xs focus:bg-primary/5 focus:text-primary">Kg</SelectItem>
                        <SelectItem value="hộp" className="cursor-pointer rounded-xl font-bold p-2 text-xs focus:bg-primary/5 focus:text-primary">Hộp</SelectItem>
                        <SelectItem value="quả" className="cursor-pointer rounded-xl font-bold p-2 text-xs focus:bg-primary/5 focus:text-primary">Quả</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Tồn kho</label>
                  <div className="h-9 w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 flex items-center text-[13px] font-black text-gray-400">
                    {editingProduct.id ? (editingProduct.stockQuantity || 0) : 0} {editingProduct.unit}
                    {!editingProduct.id && <span className="ml-2 text-[9px] font-bold text-primary/60 uppercase">(Mặc định 0)</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Mô tả sản phẩm</label>
                <RichTextEditor
                  placeholder="Nhập mô tả chi tiết về sản phẩm..."
                  value={editingProduct.description || ''}
                  onChange={content => setEditingProduct({ ...editingProduct, description: content })}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">Thông tin dinh dưỡng</label>
                <RichTextEditor
                  placeholder="Nhập thông tin dinh dưỡng của sản phẩm..."
                  value={editingProduct.healthInfo || ''}
                  onChange={content => setEditingProduct({ ...editingProduct, healthInfo: content })}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">Hình ảnh / Video sản phẩm (*)</label>
                <p className="text-[11px] font-bold text-gray-400 ml-1">Kéo thả để sắp xếp. Ảnh đầu tiên sẽ là ảnh đại diện.</p>

                {/* Gallery Grid */}
                <div className="flex flex-wrap gap-3">
                  {(editingProduct.mediaUrls || []).map((url, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "relative group w-20 h-20 rounded-2xl overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all",
                        idx === 0 ? "border-primary ring-2 ring-primary/20" : "border-gray-100",
                        dragIdx === idx && "opacity-50 scale-95"
                      )}
                    >
                      {isVideoUrl(url) ? (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                          <Film className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <img src={getImageUrl(url)} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                      )}
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 text-[7px] font-black uppercase bg-primary text-white px-1.5 py-0.5 rounded-md">Đại diện</span>
                      )}
                      <button
                        onClick={() => removeMedia(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                      <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-60 transition-opacity">
                        <GripVertical size={14} className="text-white drop-shadow" />
                      </div>
                    </div>
                  ))}

                  {/* Add Image Button */}
                  <div className="relative group">
                    <div className={cn(
                      "w-20 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary/50",
                      errors.image ? "border-red-500 bg-red-50/30" : "border-gray-200 bg-gray-50/50"
                    )}>
                      <ImageIcon size={18} className="text-gray-300 group-hover:text-primary/50 transition-colors" />
                      <span className="text-[8px] font-bold text-gray-400 mt-1">Thêm ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('Hình ảnh vượt quá dung lượng giới hạn (tối đa 5MB)');
                              e.target.value = '';
                              return;
                            }
                            setCropFile(file);
                            setIsCropModalOpen(true);
                          }
                          e.target.value = '';
                        }}
                      />
                    </div>
                  </div>

                  {/* Add Video Button */}
                  <div className="relative group">
                    <div className={cn(
                      "w-20 h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary/50",
                      "border-gray-200 bg-gray-50/50"
                    )}>
                      <Film size={18} className="text-gray-300 group-hover:text-primary/50 transition-colors" />
                      <span className="text-[8px] font-bold text-gray-400 mt-1">Thêm video</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleVideoUpload}
                      />
                    </div>
                  </div>
                </div>
                {isUploading && <p className="text-[11px] font-bold text-primary ml-1 animate-pulse">Đang tải lên...</p>}
                {errors.image && <p className="text-red-500 text-[9px] font-bold uppercase ml-2 mt-1">{errors.image}</p>}
              </div>

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
                          uploadProductMedia(cropped);
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
                              {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon size={16} />}
                            </ImageCropApply>
                          </div>
                        </div>
                      </ImageCrop>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-8 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-full px-6 cursor-pointer font-bold h-8 text-xs">
                Hủy
              </Button>
              <Button onClick={handleSaveProduct} className="rounded-full bg-primary text-white px-6 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer h-8 font-black uppercase tracking-widest text-[9px]">
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-gray-700 ml-1">Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Bạn có chắc chắn muốn gỡ bỏ sản phẩm này không? Sản phẩm sẽ bị ẩn khỏi cửa hàng và trang quản trị, nhưng lịch sử đơn hàng vẫn được giữ lại để đối soát. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-gray-200 cursor-pointer">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId && handleDeleteProduct(confirmDeleteId)}
              className="rounded-full bg-red-500 hover:bg-red-600 text-white cursor-pointer"
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
