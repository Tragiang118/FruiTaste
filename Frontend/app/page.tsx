'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, Check, CheckCircle, CreditCard, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/axios';
import { useCartStore, useAuthStore } from '@/lib/store';

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<number | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const categoryColors = ['bg-red-500', 'bg-yellow-500', 'bg-rose-500', 'bg-green-500'];
  const productBgColors = ['bg-green-50', 'bg-yellow-50', 'bg-red-50', 'bg-orange-50'];
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products'),
        ]);
        setCategories(catsRes.data.slice(0, 5) || []);
        setProducts(prodsRes.data.slice(0, 4) || []);
      } catch (err) {
        console.error('Error fetching data for home page', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-gray-900 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <section className="flex flex-col md:flex-row items-center justify-between rounded-3xl shadow-lg">
          <div className="md:w-1/2 bg-white m-10 p-6 rounded-3xl">
            <span className="text-orange-500 font-medium mb-4 block uppercase tracking-wider text-sm">
              Trái cây sạch từ vườn
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-[#1A1A1A]">
              Trái Cây Tươi <br />
              Giao Tận Nơi <br />
              Cho Bạn
            </h1>
            <div className="flex flex-wrap gap-4 items-center mt-8">
              <Link href="/products">
                 <Button className="bg-[#FF6B4A] hover:bg-[#E55A39] text-white px-8 py-6 rounded-full font-medium transition-all shadow-lg shadow-orange-200 text-base">
                   Mua Sắm Ngay
                 </Button>
              </Link>
              <Link href="/products">
                 <Button variant="ghost" className="text-gray-600 hover:text-[#FF6B4A] font-medium flex items-center gap-2 hover:bg-transparent text-base">
                   Xem Sản Phẩm <ArrowRight size={18} />
                 </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative mt-12 md:mt-0 flex justify-center items-center p-8">
            <div className="absolute w-[350px] h-[350px] md:w-[450px] md:h-[450px] bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full z-0 opacity-50 blur-[60px]"></div>
            <img
              src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80"
              alt="Fresh Fruit Mix"
              className="relative z-10 w-[320px] h-[320px] md:w-[400px] md:h-[400px] object-cover drop-shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-full border-5 border-white"
            />
          </div>
        </section>

        <section className="py-12">
          {!loading && categories.length > 0 && (
            <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x">
              {categories.map((cat, idx) => (
                <Link href={`/products?categoryId=${cat.id}`} key={cat.id}>
                  <div
                    className={`${categoryColors[idx % categoryColors.length]} rounded-[2rem] p-6 w-[280px] shrink-0 h-[260px] flex flex-col justify-between text-white relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer shadow-sm snap-start`}
                  >
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold line-clamp-2">{cat.name}</h3>
                      <p className="text-sm mt-2 opacity-90 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Xem thêm <ArrowRight size={14} />
                      </p>
                    </div>
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="absolute -bottom-10 -right-10 w-48 h-48 object-cover rounded-full border-4 border-white/20 group-hover:rotate-12 transition-transform duration-500 bg- white/30 filter drop-shadow-lg"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-2">
             <Link href="/products">
                 <Button variant="ghost" className="text-gray-600 hover:text-[#FF6B4A] font-medium flex items-center gap-2 hover:bg-transparent text-base">
                   Xem tất cả danh mục <ArrowRight size={18} />
                 </Button>
             </Link>
          </div>
        </section>

        <section className="py-0">
          <h2 className="text-3xl font-bold mb-10 text-[#1A1A1A]">Sản Phẩm Nổi Bật</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative pb-8">
            {!loading && products.map((p, idx) => {
              const added = addedId === p.id;
              return (
              <Card key={p.id} className="rounded-3xl border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow relative group">
                <CardContent className="p-4">
                  <Link href={`/products/${p.id}`}>
                      <div className={`${productBgColors[idx % productBgColors.length]} rounded-2xl aspect-[4/3] w-full flex items-center justify-center mb-6 overflow-hidden`}>
                          <img src={p.images?.[0] || 'https://via.placeholder.com/300'} alt={p.name} className="w-full h-full object-cover filter drop-shadow-md mix-blend-multiply group-hover:scale-110 transition-transform duration-300" />
                      </div>
                  </Link>
                  <div className="px-2 flex flex-col flex-1">
                    <Link href={`/products/${p.id}`}>
                       <h3 className="text-[14px] leading-[20px] font-[600] text-gray-900 line-clamp-2 group-hover:text-green-500 transition-colors mb-2" title={p.name}>{p.name}</h3>
                    </Link>
                    <p className="text-green-500 font-bold text-[20px] mt-auto mb-4">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                        <span className="text-gray-400 text-[14px] font-medium ml-1">/ {p.unit || 'kg'}</span>
                    </p>
                    <Button 
                      onClick={(e) => {
                        e.preventDefault();
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
                            image: p.images?.[0] || 'https://via.placeholder.com/300',
                            stockQuantity: p.stockQuantity || 10
                        });
                        setAddedId(p.id);
                        setTimeout(() => setAddedId(null), 1600);
                      }}
                      className={`absolute bottom-6 right-6 w-10 h-10 rounded-full p-0 flex items-center justify-center border transition-all ${
                        added 
                          ? 'bg-green-500 text-white border-green-500 scale-[0.98]' 
                          : 'bg-gradient-to-br from-green-50 to-green-100 text-green-500 border-green-200 hover:bg-green-500 hover:text-white hover:shadow-md'
                      }`}
                    >
                      {added ? <Check size={20} /> : <Plus size={20} />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
          <div className="flex justify-end mt-2">
             <Link href="/products">
                <Button variant="ghost" className="text-gray-600 hover:text-[#FF6B4A] font-medium flex items-center gap-2 hover:bg-transparent text-base">
                   Xem tất cả sản phẩm <ArrowRight size={18} />
                 </Button>
             </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
