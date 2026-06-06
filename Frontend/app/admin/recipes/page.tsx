'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  RefreshCw, 
  ChefHat, 
  Clock, 
  Image as ImageIcon,
  PlusCircle,
  X,
  Camera,
  Loader2
} from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ImageCrop,
  ImageCropContent,
  ImageCropReset,
  ImageCropApply,
} from '@/components/ui/image-crop';
import { getAvatarUrl, cn, getImageUrl } from '@/lib/utils';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

const countWords = (str: string | undefined) => {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
};

interface RecipeIngredient {
  productId?: number;
  ingredientName?: string;
  quantityStr: string;
  product?: { name: string };
}

interface Recipe {
  id: number;
  name: string;
  description?: string;
  prepTime?: number;
  instructions: string;
  imageUrl?: string;
  ingredients: RecipeIngredient[];
}

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Partial<Recipe>>({
    name: '',
    description: '',
    prepTime: 30,
    instructions: '',
    imageUrl: '',
    ingredients: []
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ingredientSearchQueries, setIngredientSearchQueries] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setIsCropDialogOpen(true);
    }
  };

  const uploadRecipeImage = async (base64Image: string) => {
    setIsUploading(true);
    try {
      const res = await fetch(base64Image);
      const blob = await res.blob();
      const file = new File([blob], 'recipe.png', { type: 'image/png' });

      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/upload/recipe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setEditingRecipe({ ...editingRecipe, imageUrl: uploadRes.data.imageUrl });
      toast.success('Tải ảnh lên thành công!');
      setIsCropDialogOpen(false);
      setImageFile(null);
      setCroppedImage(null);
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Tải ảnh lên thất bại.');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recipeRes, productRes] = await Promise.all([
        api.get('/recipes'),
        api.get('/products/admin')
      ]);
      setRecipes(recipeRes.data);
      setProducts(productRes.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingRecipe({
      name: '',
      description: '',
      prepTime: 30,
      instructions: '',
      imageUrl: '',
      ingredients: []
    });
    setIngredientSearchQueries({});
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe({ ...recipe });
    setErrors({});
    
    // Khởi tạo tên cho các ô tìm kiếm nguyên liệu khi mở modal sửa
    const initialQueries: Record<number, string> = {};
    recipe.ingredients?.forEach((ing, idx) => {
        if (ing.productId) {
            const prod = products.find(p => p.id === ing.productId);
            if (prod) initialQueries[idx] = prod.name;
        } else if (ing.ingredientName) {
            initialQueries[idx] = ing.ingredientName;
        }
    });
    setIngredientSearchQueries(initialQueries);
    
    setIsModalOpen(true);
  };

  const handleAddIngredient = () => {
    const newIngredients = [...(editingRecipe.ingredients || []), { quantityStr: '' }];
    setEditingRecipe({ ...editingRecipe, ingredients: newIngredients });
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...(editingRecipe.ingredients || [])];
    newIngredients.splice(index, 1);
    setEditingRecipe({ ...editingRecipe, ingredients: newIngredients });
  };

  const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: any) => {
    const newIngredients = [...(editingRecipe.ingredients || [])];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    
    // Nếu chọn sản phẩm, xóa ingredientName và ngược lại (đơn giản hóa)
    if (field === 'productId' && value) {
        newIngredients[index].ingredientName = undefined;
    }
    if (field === 'ingredientName' && value) {
        newIngredients[index].productId = undefined;
    }

    setEditingRecipe({ ...editingRecipe, ingredients: newIngredients });
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!editingRecipe.name?.trim()) newErrors.name = 'Tên món ăn không được để trống';
    if (!editingRecipe.description?.trim()) newErrors.description = 'Mô tả ngắn không được để trống';
    if (!editingRecipe.prepTime || editingRecipe.prepTime <= 0) newErrors.prepTime = 'Thời gian chuẩn bị phải lớn hơn 0';
    if (!editingRecipe.instructions?.trim()) newErrors.instructions = 'Hướng dẫn không được để trống';
    if (!editingRecipe.ingredients?.length) newErrors.ingredients = 'Cần ít nhất một nguyên liệu';
    if (!editingRecipe.imageUrl) {
      newErrors.image = 'Vui lòng tải ảnh đại diện';
    } else {
      const imageUrl = editingRecipe.imageUrl;
      const isDataUrl = imageUrl.startsWith('data:image/');
      // Chỉ kiểm tra phần path chính của URL, loại bỏ query (?) và fragment (#)
      const cleanUrl = imageUrl.split(/[?#]/)[0];
      const hasImageExtension = /\.(jpg|jpeg|png|webp|avif)$/i.test(cleanUrl);
      
      if (!isDataUrl && !hasImageExtension && !imageUrl.startsWith('/uploads/')) {
        newErrors.image = 'Link không đúng định dạng ảnh (phải là .jpg, .jpeg, .png, .webp, .avif)';
      }
    }
    
    if (editingRecipe.description && editingRecipe.description.length > 300) {
      newErrors.description = 'Mô tả ngắn không được vượt quá 300 ký tự';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return toast.error('Vui lòng kiểm tra lại thông tin');
    }

    try {
      const payload = {
        ...editingRecipe,
        prepTime: Number(editingRecipe.prepTime),
        ingredients: (editingRecipe.ingredients || []).map(ing => ({
            productId: ing.productId ? Number(ing.productId) : undefined,
            ingredientName: ing.ingredientName || undefined,
            quantityStr: ing.quantityStr
        }))
      };

      if (editingRecipe.id) {
        await api.put(`/recipes/${editingRecipe.id}`, payload);
        toast.success('Cập nhật thành công');
      } else {
        await api.post('/recipes', payload);
        toast.success('Thêm mới thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Lỗi lưu công thức:', error);
      toast.error('Có lỗi xảy ra khi lưu');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/recipes/${id}`);
      toast.success('Đã xóa thành công');
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi xóa');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6 w-full">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" />
            Quản lý Món ăn
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các món ăn từ trái cây</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={fetchData} variant="outline" className="bg-white rounded-full text-gray-700 cursor-pointer border-gray-200 h-8 px-4 text-xs font-bold shadow-none">
            <RefreshCw className={cn("mr-2 h-3.5 w-3.5 text-gray-500", loading && "animate-spin")} /> Làm mới
          </Button>
          <Button onClick={openAddModal} className="bg-[#1a1a1a] text-white rounded-full px-5 shadow-lg shadow-black/10 hover:scale-[1.02] transition-all cursor-pointer h-8 font-bold text-xs">
            <PlusCircle className="mr-2 h-3.5 w-3.5" />
            Thêm mới
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="p-6 pb-2">
           <div className="relative max-w-md w-full">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
             <Input 
               placeholder="Tìm kiếm theo tên món ăn..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="pl-9 rounded-full bg-gray-50/50 border-gray-200 h-8 text-[13px] shadow-none font-medium focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300 hover:border-gray-300 transition-colors"
             />
           </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
             <div className="flex justify-center items-center h-40 text-gray-400 font-medium">Đang tải dữ liệu...</div>
          ) : (
             <Table>
               <TableHeader className="bg-gray-50/50">
                 <TableRow className="border-none hover:bg-transparent">
                   <TableHead className="w-24 text-center p-4 font-bold text-gray-700">ID</TableHead>
                   <TableHead className="p-4 font-bold text-gray-700">Món ăn</TableHead>
                   <TableHead className="w-40 text-right p-4 font-bold text-gray-700 pr-10">Thao tác</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredRecipes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                        Không tìm thấy món ăn nào.
                      </TableCell>
                    </TableRow>
                 ) : filteredRecipes.map((recipe) => (
                   <TableRow key={recipe.id} className="hover:bg-gray-50/50 transition-colors group border-gray-50">
                     <TableCell className="text-center font-black text-gray-900 p-4">#{recipe.id}</TableCell>
                     <TableCell className="p-4">
                       <div className="flex items-start gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center mt-0.5 shadow-sm">
                           {recipe.imageUrl ? (
                             <img src={getImageUrl(recipe.imageUrl)} alt={recipe.name} className="w-full h-full object-cover" />
                           ) : (
                             <ChefHat className="w-7 h-7 text-gray-400" />
                           )}
                         </div>
                         <div className="flex flex-col gap-1 min-w-0">
                           <span className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{recipe.name}</span>
                           <span className="text-sm text-gray-500 whitespace-normal leading-relaxed text-justify pr-10">
                             {recipe.description}
                           </span>
                           <div className="flex items-center gap-4 mt-1">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                                    <Clock size={12} /> {recipe.prepTime || 0} phút
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                                    <ChefHat size={12} /> {recipe.ingredients?.length || 0} nguyên liệu
                                </span>
                           </div>
                         </div>
                       </div>
                     </TableCell>
                     <TableCell className="text-right p-4 pr-10">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(recipe)} className="h-10 w-10 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition-all">
                            <Edit size={18} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteId(recipe.id)} className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer transition-all">
                            <Trash2 size={18} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-sm font-bold text-gray-700 ml-1">{editingRecipe.id ? 'Sửa món ăn' : 'Thêm món ăn mới'}</h2>
                <p className="text-sm text-gray-500 mt-1">Điền thông tin chi tiết cho món ăn.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full">
                <X size={20} />
              </Button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto bg-[#FAFAFA]">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Tên món ăn (*)</label>
                        <Input 
                            value={editingRecipe.name || ''} 
                            onChange={e => {
                              setEditingRecipe(prev => ({...prev, name: e.target.value}));
                              if (errors.name) setErrors(prev => ({...prev, name: ''}));
                            }}
                            placeholder="VD: Salad Trái cây nhiệt đới"
                            className={cn("rounded-2xl border-gray-100 h-12", errors.name && "border-red-500")}
                        />
                        {errors.name && <p className="text-red-500 text-[9px] font-bold uppercase ml-2 mt-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Thời gian chuẩn bị (phút) (*)</label>
                        <Input 
                            type="number"
                            value={editingRecipe.prepTime || ''} 
                            onChange={e => {
                              const val = e.target.value === '' ? 0 : Number(e.target.value);
                              setEditingRecipe(prev => ({...prev, prepTime: val}));
                              if (errors.prepTime) setErrors(prev => ({...prev, prepTime: ''}));
                            }}
                            className={cn("rounded-2xl border-gray-100 h-12", errors.prepTime && "border-red-500")}
                        />
                        {errors.prepTime && <p className="text-red-500 text-[9px] font-bold uppercase ml-2 mt-1">{errors.prepTime}</p>}
                    </div>
                    <Field className="space-y-2">
                        <FieldLabel className="text-sm font-bold text-gray-700 ml-1">Mô tả ngắn (*)</FieldLabel>
                        <Textarea 
                            value={editingRecipe.description || ''} 
                            onChange={e => {
                              setEditingRecipe(prev => ({...prev, description: e.target.value}));
                              if (errors.description) setErrors(prev => ({...prev, description: ''}));
                            }}
                            placeholder="Mô tả ngắn về món ăn (tối đa 300 ký tự)..."
                            className={cn(
                                "rounded-2xl border-gray-100 min-h-[120px] leading-relaxed p-4 bg-gray-50/30",
                                ((editingRecipe.description?.length || 0) > 300 || errors.description) && "border-red-500 focus-visible:ring-red-500/20"
                            )}
                        />
                        {errors.description && <p className="text-red-500 text-[9px] font-bold uppercase ml-2 mt-1">{errors.description}</p>}
                        <FieldDescription className={cn(
                            "text-[10px] font-bold uppercase tracking-wider flex justify-end items-center px-1 mt-1",
                            (editingRecipe.description?.length || 0) > 300 ? "text-red-500" : "text-gray-400"
                        )}>
                            <span className={cn(
                                "px-2 py-1 rounded-lg border transition-colors",
                                (editingRecipe.description?.length || 0) > 300 
                                  ? "bg-red-50 border-red-200 text-red-600" 
                                  : "bg-gray-50 border-gray-100 text-gray-500"
                            )}>
                                {editingRecipe.description?.length || 0} {" / 300 ký tự"}
                            </span>
                        </FieldDescription>
                    </Field>
                </div>
                <div className="space-y-4">
                <div className="space-y-2 col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Hình ảnh công thức (*)</label>
                    <div className="flex items-center gap-4">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            "w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center bg-gray-50/50 overflow-hidden shrink-0 group hover:border-primary/50 transition-colors cursor-pointer",
                            errors.image ? "border-red-500 bg-red-50/30" : "border-gray-100"
                          )}
                        >
                           {editingRecipe.imageUrl ? (
                             <img src={getImageUrl(editingRecipe.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                           ) : (
                             <div className="text-gray-300 group-hover:text-primary/50 transition-colors">
                               <PlusCircle size={24} />
                             </div>
                           )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <p className="text-[11px] font-bold text-gray-400">Bạn có thể tải ảnh lên và cắt ảnh, hoặc dán link ảnh trực tiếp vào bên dưới.</p>
                            <Input 
                              placeholder="Dán link ảnh tại đây (https://...)" 
                              value={editingRecipe.imageUrl || ''} 
                              onChange={e => {
                                setEditingRecipe({...editingRecipe, imageUrl: e.target.value});
                                if (errors.image) setErrors(prev => ({...prev, image: ''}));
                              }} 
                              className={cn(
                                "rounded-2xl border-gray-100 h-11 bg-white font-bold text-[13px]",
                                errors.image && "border-red-500"
                              )} 
                            />
                        </div>
                    </div>
                    {errors.image && <p className="text-red-500 text-[9px] font-bold uppercase ml-2 mt-1">{errors.image}</p>}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e) => {
                        handleFileChange(e);
                        if (errors.image) setErrors(prev => ({...prev, image: ''}));
                      }} 
                      className="hidden" 
                      accept="image/*" 
                    />
                </div>
              </div>
            </div>

              {/* Instructions */}
              <Field className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-2">
                <FieldLabel className="text-sm font-bold text-gray-700 ml-1">Hướng dẫn thực hiện (*)</FieldLabel>
                <Textarea 
                    value={editingRecipe.instructions || ''} 
                    onChange={e => {
                      setEditingRecipe(prev => ({...prev, instructions: e.target.value}));
                      if (errors.instructions) setErrors(prev => ({...prev, instructions: ''}));
                    }}
                    placeholder="Bước 1: Rửa sạch trái cây...&#10;Bước 2: Cắt nhỏ...&#10;Bước 3: Trộn sốt..."
                    className={cn(
                      "min-h-[150px] rounded-2xl border-gray-100 p-4 leading-relaxed bg-gray-50/30",
                      errors.instructions && "border-red-500 focus-visible:ring-red-500/20"
                    )}
                />
                {errors.instructions && <p className="text-red-500 text-[9px] font-bold uppercase ml-2 mt-1">{errors.instructions}</p>}
                <FieldDescription className="text-[10px] font-bold uppercase tracking-wider flex justify-end items-center px-1 text-gray-400">
                    <span className="px-2 py-1 rounded-lg border bg-gray-50 border-gray-100">
                        {countWords(editingRecipe.instructions)} từ
                    </span>
                </FieldDescription>
              </Field>

              {/* Ingredients List */}
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700 ml-1">Nguyên liệu (*)</label>
                    <Button type="button" onClick={() => {
                      handleAddIngredient();
                      if (errors.ingredients) setErrors(prev => ({...prev, ingredients: ''}));
                    }} variant="outline" size="sm" className="rounded-full h-8 text-primary border-primary/20 hover:bg-primary/5 cursor-pointer">
                        <Plus size={14} className="mr-1" /> Thêm nguyên liệu
                    </Button>
                </div>
                {errors.ingredients && <p className="text-red-500 text-[9px] font-bold uppercase ml-2 mt-1">{errors.ingredients}</p>}
                
                <div className="space-y-3">
                    {editingRecipe.ingredients?.map((ing, idx) => (
                        <div key={idx} className="flex gap-3 items-start animate-in slide-in-from-top-2 duration-200">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                                <Combobox 
                                    value={products.find(p => p.id === ing.productId)?.name || ""}
                                    onValueChange={(name) => {
                                        const prod = products.find(p => p.name === name);
                                        if (prod) {
                                            handleIngredientChange(idx, 'productId', prod.id);
                                        }
                                    }}
                                    inputValue={ingredientSearchQueries[idx] || ""}
                                    onInputValueChange={(val) => setIngredientSearchQueries(prev => ({...prev, [idx]: val}))}
                                >
                                    <ComboboxInput 
                                        placeholder="Tìm hoa quả..." 
                                        className="h-11 rounded-xl border-gray-100 bg-gray-50 text-sm shadow-none focus-within:border-primary/40 transition-colors"
                                        showClear
                                    />
                                    <ComboboxContent>
                                        <ComboboxList>
                                            {products.filter(p => 
                                                p.name.toLowerCase().includes((ingredientSearchQueries[idx] || "").toLowerCase())
                                            ).length > 0 ? (
                                                products
                                                .filter(p => p.name.toLowerCase().includes((ingredientSearchQueries[idx] || "").toLowerCase()))
                                                .map(p => (
                                                    <ComboboxItem key={p.id} value={p.name}>
                                                        {p.name}
                                                    </ComboboxItem>
                                                ))
                                            ) : (
                                                <div className="py-4 text-center text-sm text-gray-400">
                                                    Không tìm thấy hoa quả
                                                </div>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <Input 
                                    placeholder="Hoặc tên nguyên liệu khác..." 
                                    value={ing.ingredientName || ''}
                                    onChange={(e) => handleIngredientChange(idx, 'ingredientName', e.target.value)}
                                    className="h-11 rounded-xl border-gray-100 bg-gray-50 shadow-none"
                                    disabled={!!ing.productId}
                                />
                            </div>
                            <div className="w-32">
                                <Input 
                                    placeholder="Số lượng (VD: 200g)" 
                                    value={ing.quantityStr || ''}
                                    onChange={(e) => handleIngredientChange(idx, 'quantityStr', e.target.value)}
                                    className="h-11 rounded-xl border-gray-100 bg-gray-50"
                                />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveIngredient(idx)} className="h-11 w-11 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl cursor-pointer">
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    ))}
                    {editingRecipe.ingredients?.length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-4">Chưa có nguyên liệu nào. Nhấn "Thêm nguyên liệu" để bắt đầu.</p>
                    )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 z-10">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-full px-8 cursor-pointer">
                Hủy
              </Button>
              <Button onClick={handleSave} className="rounded-full bg-primary text-white px-8 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer">
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-gray-700 ml-1">Xác nhận xóa món ăn</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa món ăn này khỏi hệ thống không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel className="rounded-full border-gray-100 cursor-pointer">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)} className="rounded-full bg-red-500 hover:bg-red-600 text-white cursor-pointer">
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Recipe Image Crop Dialog */}
      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-xl border-none p-8">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-gray-700 ml-1">Cắt ảnh món ăn</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            {imageFile && (
              <ImageCrop file={imageFile} aspect={1.7778} onCrop={setCroppedImage}>
                <ImageCropContent className="max-w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100" />
                <div className="mt-4 flex justify-center gap-4">
                  <ImageCropReset className="rounded-xl hover:bg-gray-100" />
                  <ImageCropApply className="rounded-xl bg-primary text-white hover:bg-primary/90" />
                </div>
              </ImageCrop>
            )}
            {croppedImage && (
              <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300 w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Xem trước</span>
                <div className="p-1 bg-white rounded-2xl shadow-md border border-gray-50 overflow-hidden w-full aspect-video">
                  <img src={croppedImage} alt="Cropped" className="w-full h-full object-cover rounded-xl" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => croppedImage && uploadRecipeImage(croppedImage)} 
              disabled={!croppedImage || isUploading}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 font-black uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sử dụng ảnh này'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
