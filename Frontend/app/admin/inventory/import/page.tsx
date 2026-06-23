'use client';

import { useState, useEffect, Suspense } from 'react';
import api from '@/lib/axios';
import { 
  Package,
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  Search,
  ShoppingCart,
  Calculator,
  User,
  FileText,
  RefreshCw,
  Info,
  Calendar as CalendarIcon,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn, getImageUrl } from '@/lib/utils';
import BackButton from '@/components/BackButton';

interface Product {
  id: number;
  name: string;
  unit: string;
  price: number;
  stockQuantity: number;
  mediaUrls?: string[];
}

interface ImportItem {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  importPrice: number;
  unit: string;
  suggestedPrice: number;
  product?: any;
}

function ImportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedProductId = searchParams.get('productId');

  const [type, setType] = useState<'import' | 'export'>((searchParams.get('type') as 'import' | 'export') || 'import');
  const [exportReason, setExportReason] = useState<'damaged' | 'internal' | 'other'>('damaged');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [search, setSearch] = useState('');
  const [importItems, setImportItems] = useState<ImportItem[]>([]);
  const [pricingConfig, setPricingConfig] = useState<any>(null);
  const [receiver, setReceiver] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, configRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/pricing/config'),
          api.get('/categories')
        ]);
        const allProducts = prodRes.data;
        setProducts(allProducts);
        setPricingConfig(configRes.data);
        setCategories(catRes.data);

        // Tự động thêm sản phẩm nếu có productId từ URL
        if (preSelectedProductId) {
          const product = allProducts.find((p: Product) => p.id === Number(preSelectedProductId));
          if (product) {
            const defaultImportPrice = Math.round(product.price * 0.7);
            
            const lossRate = 0.05;
            const taxRate = configRes.data.defaultTaxRate || 0.08;
            const profitMargin = configRes.data.defaultProfitMargin || 0.20;

            const effectiveCost = defaultImportPrice / (1 - lossRate);
            const suggested = effectiveCost / (1 - (profitMargin + taxRate));
            const finalSuggested = Math.ceil(suggested / 1000) * 1000;

            setImportItems([{
              productId: product.id,
              productName: product.name,
              productImage: product.mediaUrls?.[0] || '',
              quantity: 1,
              importPrice: defaultImportPrice,
              unit: product.unit,
              suggestedPrice: finalSuggested,
              product: product
            }]);
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        toast.error('Không thể tải dữ liệu ban đầu');
      }
    };
    fetchData();
  }, [preSelectedProductId]);

  const calculateSuggestedPrice = (importPrice: number) => {
    if (!pricingConfig) return 0;
    
    const lossRate = 0.05; // 5% hao hụt
    const taxRate = pricingConfig.defaultTaxRate || 0.08; // 8% thuế
    const profitMargin = pricingConfig.defaultProfitMargin || 0.20; // 20% lãi

    const effectiveCost = importPrice / (1 - lossRate);
    const totalVariableRates = profitMargin + taxRate;
    
    let suggested = effectiveCost / (1 - totalVariableRates);
    return Math.ceil(suggested / 1000) * 1000; // Làm tròn lên hàng nghìn
  };

  const addItem = (product: Product) => {
    if (importItems.find(item => item.productId === product.id)) {
      toast.error('Sản phẩm này đã có trong danh sách nhập');
      return;
    }
    
    const defaultImportPrice = Math.round(product.price * 0.7);
    
    setImportItems([...importItems, {
      productId: product.id,
      productName: product.name,
      productImage: product.mediaUrls?.[0] || '',
      quantity: 1,
      importPrice: defaultImportPrice,
      unit: product.unit,
      suggestedPrice: calculateSuggestedPrice(defaultImportPrice),
      product: product
    }]);
  };

  const removeItem = (id: number) => {
    setImportItems(importItems.filter(i => i.productId !== id));
  };

  const updateItem = (id: number, field: string, value: any) => {
    setImportItems(importItems.map(i => {
      if (i.productId === id) {
        const updatedItem = { ...i, [field]: value };
        
        if (field === 'quantity') {
          if (value === '') {
            updatedItem.quantity = '' as any;
          } else {
            const num = parseInt(value);
            updatedItem.quantity = num <= 0 ? 1 : num;
          }
        }
        
        if (field === 'importPrice') {
          if (value === '') {
             updatedItem.importPrice = '' as any;
             updatedItem.suggestedPrice = 0;
          } else {
             const price = parseInt(value) || 0;
             updatedItem.importPrice = Math.max(0, price);
             updatedItem.suggestedPrice = calculateSuggestedPrice(updatedItem.importPrice);
          }
        }
        
        return updatedItem;
      }
      return i;
    }));
  };

  const totalCost = importItems.reduce((sum, i) => sum + (Number(i.importPrice || 0) * Number(i.quantity || 0)), 0);



  const handleSubmit = async () => {
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (importItems.length === 0) {
      newErrors.items = `Vui lòng chọn ít nhất một sản phẩm để ${type === 'import' ? 'nhập' : 'xuất'} kho`;
    }

    const invalidItem = importItems.find(item => !item.quantity || Number(item.quantity) <= 0);
    if (invalidItem) {
      toast.error(`Sản phẩm "${invalidItem.productName}" phải có số lượng ít nhất là 1`);
      return;
    }

    if (type === 'export') {
      const overStockItem = importItems.find(item => Number(item.quantity) > (item.product?.stockQuantity || 0));
      if (overStockItem) {
        toast.error(`Sản phẩm "${overStockItem.productName}" vượt quá tồn kho khả dụng (${overStockItem.product?.stockQuantity || 0} ${overStockItem.unit})`);
        return;
      }
    }

    if (type === 'import') {
      const invalidPriceItem = importItems.find(item => !item.importPrice || Number(item.importPrice) < 1000);
      if (invalidPriceItem) {
        toast.error(`Sản phẩm "${invalidPriceItem.productName}" phải có giá nhập từ 1,000 VNĐ`);
        return;
      }
    }

    if (!receiver.trim()) {
      if (type === 'import') {
        newErrors.receiver = 'Vui lòng nhập tên người nhập kho';
      } else {
        newErrors.receiver = exportReason === 'damaged' ? 'Vui lòng nhập tên người xác nhận kiểm kho' : 'Vui lòng nhập tên người nhận';
      }
    }

    if (type === 'import' && !note.trim()) {
      newErrors.note = 'Vui lòng nhập ghi chú cho phiếu này';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      if (type === 'import') {
        await api.post('/inventory/import', {
          items: importItems.map(item => ({
            productId: item.productId,
            quantity: Number(item.quantity),
            importPrice: Number(item.importPrice)
          })),
          supplier: receiver,
          note,
          createdAt: transactionDate
        });

        for (const item of importItems) {
           await api.post(`/pricing/apply/${item.productId}`, {
             productId: item.productId,
             costPrice: Number(item.importPrice),
             lossRate: 0.05
           });
        }
        toast.success('Nhập kho và cập nhật giá thành công!');
      } else {
        await api.post('/inventory/export', {
          receiver: receiver,
          reason: exportReason,
          items: importItems.map(item => ({
            productId: item.productId,
            quantity: Number(item.quantity)
          })),
          note: note,
          createdAt: transactionDate
        });
        toast.success('Xuất kho thành công!');
      }

      router.push('/admin/inventory');
    } catch (error: any) {
      console.error(`Lỗi khi ${type === 'import' ? 'nhập' : 'xuất'} kho:`, error);
      toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${type === 'import' ? 'nhập' : 'xuất'} kho`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toString() === search
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
             {type === 'import' ? 'Tạo phiếu nhập kho' : 'Tạo phiếu xuất kho'}
           </h1>
           <p className="text-gray-500 text-sm mt-0.5">
             {type === 'import' ? 'Lập phiếu nhập mới để cập nhật tồn kho sản phẩm.' : 'Lập phiếu xuất mới để giảm tồn kho sản phẩm.'}
           </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
           <Button 
             variant="ghost" 
             onClick={() => setType('import')}
             className={cn(
               "rounded-xl px-6 font-bold h-10 transition-all",
               type === 'import' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-500 hover:bg-gray-50"
             )}
           >
             Nhập kho
           </Button>
           <Button 
             variant="ghost" 
             onClick={() => setType('export')}
             className={cn(
               "rounded-xl px-6 font-bold h-10 transition-all",
               type === 'export' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-500 hover:bg-gray-50"
             )}
           >
             Xuất kho
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-50 px-6 py-5">
              <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-3">
                 Danh sách sản phẩm {type === 'import' ? 'nhập' : 'xuất'}
              </CardTitle>
              {type === 'export' && (
                <p className="text-xs font-bold text-blue-500 mt-2 ml-9 flex items-center gap-1.5 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100/50 w-fit">
                   <Info size={14} className="text-blue-500 shrink-0" />
                   Giá xuất sẽ được tính tự động dựa trên giá niêm yết hiện tại của sản phẩm
                </p>
              )}
            </CardHeader>
            <CardContent className="p-6">
               {/* Search & Quick Add */}
               <div className="relative mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input 
                        placeholder="Tìm sản phẩm (Tên hoặc ID)..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 rounded-2xl bg-gray-50/50 border-gray-100 h-10 shadow-none focus:ring-1 focus:ring-primary font-medium text-sm transition-all"
                      />
                    </div>

                  </div>
                  
                  {search && filteredProducts.length > 0 && (
                    <div className="w-full mt-2 bg-white rounded-2xl border border-gray-100 p-2 max-h-[250px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                       {filteredProducts.map(p => (
                         <div 
                           key={p.id} 
                           className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer group transition-colors"
                           onClick={() => {addItem(p); setSearch('');}}
                         >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400 text-xs group-hover:bg-primary/10 group-hover:text-primary overflow-hidden">
                                  {p.mediaUrls?.[0] ? <img src={getImageUrl(p.mediaUrls[0])} className="w-full h-full object-cover" /> : <Package size={16} />}
                                </div>
                                <div>
                                  <p className="font-black text-gray-800 text-[14px] group-hover:text-primary transition-colors">{p.name}</p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Tồn: {p.stockQuantity} {p.unit}</p>
                                </div>
                            </div>
                            <Plus className="text-gray-300 group-hover:text-primary w-5 h-5 mr-2" />
                         </div>
                       ))}
                    </div>
                  )}
               </div>

               {/* Items List */}
               <div className="space-y-4">
                  {importItems.length === 0 ? (
                    <div className={cn(
                      "py-16 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all",
                      errors.items ? "border-red-200 bg-red-50/30" : "border-gray-100 bg-gray-50/30"
                    )}>
                       <Package size={48} className={cn("transition-opacity", errors.items ? "text-red-300 opacity-50" : "text-gray-300 opacity-10")} />
                       <p className={cn("font-bold text-sm italic", errors.items ? "text-red-500" : "text-gray-300")}>
                         {errors.items || 'Hãy chọn sản phẩm để bắt đầu lập phiếu'}
                       </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                       {importItems.map((item, index) => (
                        <Card key={item.productId} className="relative rounded-[1.8rem] border-gray-100 shadow-sm bg-white overflow-hidden group">
                           <button 
                             onClick={() => removeItem(item.productId)}
                             className="absolute top-2 right-2 p-1.5 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all z-10"
                           >
                             <X size={14} strokeWidth={3} />
                           </button>

                           <CardContent className="p-3 sm:p-4 flex flex-col gap-3">
                             {/* Top Section: Product Name, Image & Quantity inline */}
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                               <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                     {item.productImage ? <img src={getImageUrl(item.productImage)} className="w-full h-full object-cover" /> : <Package size={20} className="text-gray-300" />}
                                  </div>
                                  <div className="min-w-0">
                                     <h3 className="font-black text-gray-900 text-sm sm:text-base leading-snug break-words">
                                       {item.productName}
                                     </h3>
                                  </div>
                               </div>

                               <div className="flex flex-col sm:items-end gap-1 flex-shrink-0">
                                  <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">Số lượng</span>
                                     <Input 
                                       type="number" 
                                       value={item.quantity}
                                       onChange={(e) => {
                                         const val = e.target.value === '' ? '' : Number(e.target.value);
                                         updateItem(item.productId, 'quantity', val);
                                       }}
                                       onBlur={(e) => { if (e.target.value === '') updateItem(item.productId, 'quantity', '1'); }}
                                       className="h-9 w-16 sm:w-20 rounded-xl bg-gray-50 border-gray-100 text-center font-bold text-sm focus:bg-white focus:ring-primary px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                     />
                                     <span className="text-[10px] font-black bg-blue-50 text-blue-500 px-2 py-1 rounded-md uppercase tracking-wider select-none">{item.unit}</span>
                                  </div>
                                  {type === 'export' && (
                                     <p className="text-[10px] font-bold text-gray-400 mr-2">
                                       Hiện có: <span className="text-primary">{item.product?.stockQuantity || 0}</span> {item.product?.unit}
                                     </p>
                                  )}
                                  {(item.quantity as any) !== '' && Number(item.quantity) <= 0 && (
                                     <p className="text-[9px] font-bold text-red-500 uppercase mr-2 mt-0.5 italic">Tối thiểu 1</p>
                                  )}
                               </div>
                             </div>
                             
                             {type === 'import' && (
                               <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2.5 border-t border-gray-50">
                                   <div className="space-y-1">
                                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Giá nhập (đ)</label>
                                      <Input 
                                        type="text" 
                                        value={(item.importPrice as any) !== '' ? Number(item.importPrice).toLocaleString('vi-VN') : ''}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/\./g, '');
                                          if (val === '' || /^\d+$/.test(val)) {
                                            updateItem(item.productId, 'importPrice', val === '' ? '' : Number(val));
                                          }
                                        }}
                                        onBlur={(e) => { if (e.target.value === '') updateItem(item.productId, 'importPrice', '0'); }}
                                        className="h-10 w-full rounded-xl bg-gray-50 border-gray-100 text-right font-black text-sm text-primary px-3 focus:bg-white focus:ring-primary"
                                      />
                                      {(item.importPrice as any) !== '' && Number(item.importPrice) < 1000 && (
                                        <p className="text-[9px] font-bold text-red-500 uppercase ml-2 mt-1 italic">Tối thiểu 1.000đ</p>
                                      )}
                                   </div>

                                   <div className="space-y-1">
                                      <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        <Calculator size={10} /> <span>Gợi ý</span>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                             <button className="text-amber-400 hover:text-amber-600 transition-colors"><Info size={11} /></button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-64 p-4 rounded-2xl shadow-2xl border-amber-50 bg-white" align="end">
                                             <div className="space-y-3">
                                                <h4 className="font-black text-[11px] text-gray-900 uppercase tracking-widest border-b pb-2">Phân bổ giá bán chi tiết</h4>
                                                <div className="space-y-2">
                                                   <div className="flex justify-between text-[11px]">
                                                      <span className="text-gray-400 font-bold">1. Giá gốc nhập:</span>
                                                      <span className="font-black text-gray-600">{Number(item.importPrice || 0).toLocaleString()}đ</span>
                                                   </div>
                                                   <div className="flex justify-between text-[11px]">
                                                      <span className="text-gray-400 font-bold">2. Hao hụt (5%):</span>
                                                      <span className="font-black text-orange-400">+{Math.round(Number(item.importPrice || 0) * 0.05).toLocaleString()}đ</span>
                                                   </div>
                                                   <div className="flex justify-between text-[11px] text-green-600">
                                                      <span className="font-bold">3. Lãi (20%):</span>
                                                      <span className="font-black">+{Math.round(item.suggestedPrice * 0.2).toLocaleString()}đ</span>
                                                   </div>
                                                   <div className="flex justify-between text-[11px] text-red-400">
                                                      <span className="font-bold">4. Thuế (8%):</span>
                                                      <span className="font-black">+{Math.round(item.suggestedPrice * 0.08).toLocaleString()}đ</span>
                                                   </div>
                                                </div>
                                                <div className="bg-amber-50 p-2.5 rounded-xl flex justify-between items-center mt-1 border border-amber-100">
                                                   <span className="text-[10px] font-black text-amber-600 uppercase">GIÁ BÁN GỢI Ý:</span>
                                                   <span className="text-base font-black text-amber-700">{item.suggestedPrice.toLocaleString()}đ</span>
                                                </div>
                                             </div>
                                          </PopoverContent>
                                        </Popover>
                                      </label>
                                      <div className="h-10 px-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-end font-black text-amber-600 text-sm">
                                         {item.suggestedPrice?.toLocaleString()}đ
                                      </div>
                                   </div>
                               </div>
                             )}
                            </CardContent>
                        </Card>
                       ))}
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section */}
        <div className="space-y-8">
           <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden sticky top-8">
              <CardHeader className="px-6 pt-6 pb-2">
                 <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    Thông tin phiếu
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <div className="space-y-4">
                    {type === 'export' && (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lý do xuất (*)</Label>
                        <Select 
                          value={exportReason} 
                          onValueChange={(value: any) => setExportReason(value)}
                        >
                          <SelectTrigger className="h-10 rounded-2xl bg-gray-50/50 border-gray-100 font-bold text-sm px-4">
                            <SelectValue placeholder="Chọn lý do xuất" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-2 bg-white min-w-[200px]">
                            <SelectGroup>
                              <SelectLabel className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-widest">LÝ DO CHI TIẾT</SelectLabel>
                              <SelectSeparator className="my-1 bg-gray-50" />
                              <SelectItem value="damaged" className="cursor-pointer rounded-xl font-bold p-2 text-xs focus:bg-primary/5 focus:text-primary">Hỏng hóc / Dập nát</SelectItem>
                              <SelectItem value="internal" className="cursor-pointer rounded-xl font-bold p-2 text-xs focus:bg-primary/5 focus:text-primary">Tiêu dùng nội bộ</SelectItem>
                              <SelectItem value="other" className="cursor-pointer rounded-xl font-bold p-2 text-xs focus:bg-primary/5 focus:text-primary">Khác</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {(type === 'export' || type === 'import') && (
                      <div className="space-y-1.5">
                          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            {type === 'import' ? 'Người nhập kho (*)' : (exportReason === 'damaged' ? 'Người xác nhận (*)' : 'Người nhận / Đối tác (*)')}
                          </Label>
                         <Input 
                           placeholder={type === 'import' ? "Tên người nhập..." : (exportReason === 'damaged' ? "Tên người kiểm kho..." : "Tên người nhận...")} 
                           value={receiver}
                           onChange={(e) => {
                             setReceiver(e.target.value);
                             if (errors.receiver) setErrors(prev => ({ ...prev, receiver: '' }));
                           }}
                           className={cn(
                             "h-10 rounded-2xl bg-gray-50/50 font-bold text-sm",
                             errors.receiver ? "border-red-500 focus-visible:ring-red-500" : "border-gray-100"
                           )}
                         />
                         {errors.receiver && (
                           <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{errors.receiver}</p>
                         )}
                      </div>
                    )}
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                         Ngày {type === 'import' ? 'nhập' : 'xuất'} (*)
                       </Label>
                       <Popover>
                         <PopoverTrigger asChild>
                           <Button variant="outline" className="w-full h-10 justify-start text-left font-bold text-sm rounded-2xl bg-gray-50/50 border-gray-100">
                             <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                             {format(transactionDate, "dd/MM/yyyy", { locale: vi })}
                           </Button>
                         </PopoverTrigger>
                         <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-gray-100" align="start">
                           <Calendar mode="single" selected={transactionDate} onSelect={(date) => date && setTransactionDate(date)} initialFocus locale={vi} />
                         </PopoverContent>
                       </Popover>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Ghi chú {type === 'import' ? '(*)' : ''}
                      </Label>
                      <Textarea 
                        placeholder="Ghi chú nhanh..." 
                        value={note}
                        onChange={(e) => {
                          setNote(e.target.value);
                          if (errors.note) setErrors(prev => ({ ...prev, note: '' }));
                        }}
                        className={cn(
                          "rounded-2xl bg-gray-50/50 text-xs font-medium",
                          errors.note ? "border-red-500 focus-visible:ring-red-500" : "border-gray-100"
                        )}
                      />
                      {errors.note && (
                        <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{errors.note}</p>
                      )}
                    </div>
                 </div>

                 {type === 'import' && (
                    <div className="pt-4 border-t border-gray-50 space-y-4">
                       <div className="bg-primary/5 p-5 rounded-[2rem] border border-primary/10">
                          <div className="flex justify-between items-center mb-1 text-[10px] font-black text-primary uppercase">
                             <span>Tổng tiền nhập</span>
                             <Calculator size={14} />
                          </div>
                          <span className="text-3xl font-black text-primary tracking-tighter">
                             {totalCost.toLocaleString('vi-VN')}<span className="text-sm ml-1">đ</span>
                          </span>
                       </div>
                    </div>
                 )}

                 <Button 
                   onClick={handleSubmit} 
                   disabled={isSubmitting || importItems.length === 0}
                   className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
                 >
                   {isSubmitting ? <RefreshCw className="animate-spin" /> : <Save size={22} />}
                   Xác nhận {type === 'import' ? 'nhập kho' : 'xuất kho'}
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>

    </div>
  );
}

export default function ImportInventoryPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-bold text-gray-400">Đang tải cấu hình...</div>}>
      <ImportContent />
    </Suspense>
  );
}
