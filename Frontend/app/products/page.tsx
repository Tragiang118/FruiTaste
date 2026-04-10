'use client';

import { useState, useEffect, Suspense } from 'react';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ChevronRight, Home, ChevronDown, ArrowUp, ArrowDown, Search, SlidersHorizontal, Plus, Check } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useCartStore, useAuthStore } from '@/lib/store';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function ProductsPageShell() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-green-500"></div></div>}>
      <ProductsPage />
    </Suspense>
  );
}

function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);      
  const [priceFilter, setPriceFilter] = useState('all');
  const [addedId, setAddedId] = useState<number | null>(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
           api.get('/products'),
           api.get('/categories')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  let filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const selectedCategory = categoryId ? categories.find(c => c.id === Number(categoryId)) : null;

  // Category Filtering
  if (categoryId) {
     filteredProducts = filteredProducts.filter(p => p.categoryId === Number(categoryId));
  }

  // Price Filtering
  if (priceFilter === 'under50') {
    filteredProducts = filteredProducts.filter(p => p.price < 50000);
  } else if (priceFilter === '50to100') {
    filteredProducts = filteredProducts.filter(p => p.price >= 50000 && p.price <= 100000);
  } else if (priceFilter === 'over100') {
    filteredProducts = filteredProducts.filter(p => p.price > 100000);
  }

  // Sorting
  if (sortOrder === 'asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  const handleAdd = (p: any) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    addItem({
      id: p.id,
      name: p.name,
      price: p.price,
      quantity: 1,
      image: (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
      stockQuantity: p.stockQuantity
    });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1600);
  };

  return (
    
    <div className="min-h-screen bg-[#FFFDFB] text-gray-900 pb-20 overflow-x-hidden">   
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-end mb-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 leading-tight">
                <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1 "><Home size={14}/> Trang chủ</Link>
                <ChevronRight size={14} />
                {selectedCategory ? (
                    <>
                        <Link href="/products" className="hover:text-[#FF6B4A]">Trái cây</Link>
                        <ChevronRight size={14} />
                        <span className="text-[#FF6B4A] font-medium truncate">{selectedCategory.name}</span>
                    </>
                ) : (
                    <span className="text-[#FF6B4A] font-medium truncate">Trái cây</span>
                )}
            </div>
        </div>

        <div className=" py-6 px-6 md:px-12 mb-8 bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl shadow-lg"> 
          <div className="max-w-7xl mx-auto text-center md:text-left flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-[60px] font-extrabold text-gray mb-4">Cửa hàng</h1>
              <p className="text-gray-600 max-w-md">Khám phá các loại trái cây tươi ngon được chọn lọc kỹ càng từ các nhà vườn địa phương và nhập khẩu.</p>       
            </div>

            <div className="relative w-full md:w-80">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm kiếm trái cây..."
                    className="pl-5 pr-12 py-6 rounded-full border border-gray-200 bg-white shadow-sm focus-visible:ring-green-400 focus-visible:ring-2 w-full text-base font-medium"
                />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-8 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 mr-2">Mức giá:</span>
                {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'under50', label: 'Dưới 50k' },
                    { id: '50to100', label: '50k - 100k' },
                    { id: 'over100', label: 'Trên 100k' },
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setPriceFilter(f.id)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full cursor-pointer transition-all ${priceFilter === f.id ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-600 border border-green-200 shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-50 border border-transparent'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 mr-2">Sắp xếp giá:</span>
                <button 
                    onClick={() => setSortOrder(sortOrder === 'asc' ? null : 'asc')}
                    className={`cursor-pointer flex items-center text-sm font-semibold px-4 py-2 rounded-full transition-all ${sortOrder === 'asc' ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-600 border border-green-200 shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-50 border border-transparent'}`}
                >
                    <ArrowUp size={16} className="mr-1.5" /> Thấp đến cao
                </button>
                <button 
                    onClick={() => setSortOrder(sortOrder === 'desc' ? null : 'desc')}
                    className={`cursor-pointer flex items-center text-sm font-semibold px-4 py-2 rounded-full transition-all ${sortOrder === 'desc' ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-600 border border-green-200 shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-50 border border-transparent'}`}
                >
                    <ArrowDown size={16} className="mr-1.5" /> Cao đến thấp
                </button>
            </div>
        </div>

        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-green-600" />
                <span className="text-base text-gray-600 font-bold">
                    {loading ? 'Đang tải...' : `${filteredProducts.length} sản phẩm`}
                </span>
            </div>

            <div className="flex items-center justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="rounded-full px-5 py-2 font-semibold text-gray-700 bg-white shadow-sm hover:bg-gray-50 border-gray-200">
                            {selectedCategory ? selectedCategory.name : 'Tất cả danh mục'}
                            <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-lg border-gray-100 p-2">
                        <DropdownMenuLabel className="px-3 py-1.5 text-xs text-gray-400 font-bold uppercase tracking-widest">Phân loại</DropdownMenuLabel>
                        <DropdownMenuSeparator className="my-1 bg-gray-100" />
                        <DropdownMenuRadioGroup 
                            value={categoryId || 'all'} 
                            onValueChange={(val) => router.push(val === 'all' ? '/products' : `/products?categoryId=${val}`)}
                        >
                            <DropdownMenuRadioItem 
                                value="all" 
                                className={`rounded-xl px-4 py-2.5 font-medium cursor-pointer transition-colors ${!categoryId ? 'text-[#FF6B4A]' : 'text-gray-700 hover:text-[#FF6B4A]'}`}
                            >
                                Tất cả danh mục
                            </DropdownMenuRadioItem>
                            {categories.map((c) => (
                                <DropdownMenuRadioItem 
                                    key={c.id} 
                                    value={c.id.toString()}
                                    className={`rounded-xl px-4 py-2.5 font-medium cursor-pointer transition-colors mt-1 ${categoryId === c.id.toString() ? 'text-[#FF6B4A]' : 'text-gray-700 hover:text-[#FF6B4A]'}`}
                                >
                                    {c.name}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        <div className="w-full">
           {loading ? (
             <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-green-500"></div>
             </div>
           ) : filteredProducts.length === 0 ? (
             <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-6xl mb-4">🔍</p>
                <p className="text-gray-400 text-xl font-bold mb-2">Không tìm thấy sản phẩm</p>
                <p className="text-gray-300 text-base">Thử tìm với từ khóa hoặc bộ lọc khác</p>
             </div>
           ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {filteredProducts.map((p, idx) => {
                  const added = addedId === p.id;
                  const outStock = p.stockQuantity <= 0;
                  return (
                  <div key={p.id || idx} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-100 transition-all flex flex-col group overflow-hidden">
                      <Link href={`/products/${p.id}`} className="relative overflow-hidden flex aspect-[4/3] bg-white w-full flex-shrink-0 items-center justify-center p-0">
                          <img
                            src={(p.images && p.images[0]) || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80'}   
                            alt={p.name}
                            className="w-full h-full object-cover filter mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                          />
                          {outStock && (
                             <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10">
                                 <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Hết hàng</span>
                             </div>
                          )}
                          {!outStock && p.stockQuantity <= 20 && p.stockQuantity > 0 && (
                             <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-md z-10">
                                 SẮP HẾT
                             </span>
                          )}
                      </Link>

                      <div className="p-4 flex flex-col flex-1">
                        <Link href={`/products/${p.id}`}>
                          <h3 className="text-[14px] leading-[20px] font-[600] text-gray-900 line-clamp-2 group-hover:text-green-500 transition-colors mb-2" title={p.name}>{p.name}</h3>
                        </Link>
                        
                        <p className="text-green-500 font-bold text-[20px] mt-auto mb-4">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                            <span className="text-gray-400 text-[14px] font-medium ml-1">/ {p.unit || 'kg'}</span>
                        </p>

                        <button 
                          disabled={outStock}
                          onClick={() => handleAdd(p)}
                          className={`cursor-pointer w-full flex items-center justify-center gap-1.5 text-sm font-bold py-2.5 rounded-full transition-all ${added
                                  ? 'bg-green-500 text-white scale-[0.98]'
                                  : 'bg-gradient-to-br from-green-50 to-green-100 text-green-500 hover:bg-green-500 hover:text-white hover:shadow-md'
                              } disabled:opacity-40 disabled:cursor-not-allowed border ${added ? 'border-green-500' : 'border-green-200 hover:border-green-500'}`}
                        >
                          {added
                                ? <><Check className="w-4 h-4" /> Đã thêm</>
                                : <><Plus className="w-4 h-4" /> Thêm vào giỏ</>
                            }
                        </button>
                      </div>
                  </div>
                )})}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

