'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { Home, ChevronRight, Clock, BookOpen, Utensils, Flame, ShoppingCart, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    api.get(`/recipes/${id}`)
      .then(res => setRecipe(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Đang tải công thức...</div>;
  }

  if (!recipe) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Không tìm thấy công thức</div>;
  }

  const handleAddToCart = async (product: any) => {
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.mediaUrls?.[0] || '',
        stockQuantity: product.stockQuantity
      });
      toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
    } catch (err) {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  // Lấy danh sách sản phẩm từ các nguyên liệu có liên kết sản phẩm
  const linkedProducts = recipe.ingredients
    ?.filter((ing: any) => ing.product)
    ?.map((ing: any) => ing.product) || [];

  // Tách linh hoạt: Cắt theo "Bước X:" hoặc "Bước X." hoặc dấu xuống dòng.
  const instructionSteps = recipe.instructions
    ? recipe.instructions
      // Cắt theo cụm "Bước X:" hoặc "Bước X." (không phân biệt hoa thường)
      .split(/(?=Bước\s*\d+\s*[.:])/i)
      .flatMap((s: string) => s.split('\n'))
      .map((s: string) => s.trim())
      // Bỏ chữ "Bước X..." ở đầu câu để tránh bị lặp lại
      .map((s: string) => s.replace(/^Bước\s*\d+\s*[.:]\s*/i, ''))
      .filter((s: string) => s.length > 0)
    : [];

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-gray-900 font-sans pb-20 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-end w-full mb-6 mt-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 leading-tight">
            <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1"><Home size={14} /> Trang chủ</Link>
            <ChevronRight size={14} />
            <Link href="/recipes" className="hover:text-[#FF6B4A]">Góc Món ăn</Link>
            <ChevronRight size={14} />
            <span className="text-[#FF6B4A] font-medium truncate max-w-[150px]">{recipe?.name || id}</span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
          {/* Banner Ảnh chính */}
          <div className="relative h-[400px] w-full bg-orange-50">
            <img
              src={getImageUrl(recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80")}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent flex items-end">
              <div className="p-8 text-white w-full">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{recipe.name}</h1>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium">
                    <Clock size={16} /> {recipe.prepTime || 15} phút
                  </div>
                  {recipe.cal && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium">
                      <Flame size={16} /> {recipe.cal}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <p className="text-lg text-gray-600 mb-12 leading-relaxed border-l-4 border-[#FF6B4A] pl-4 italic">
              {recipe.description || "Công thức thơm ngon, dễ làm dành cho mọi tín đồ yêu thích trái cây tươi mát."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
              {/* Cột 1: Nguyên Liệu */}
              <div className="md:col-span-2">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6 pb-2 border-b-2 border-gray-100">
                  <Utensils className="text-[#FF6B4A]" /> Nguyên liệu
                </h3>

                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <ul className="space-y-4 bg-orange-50/50 p-6 rounded-3xl border border-orange-100 mb-12 shadow-sm">
                    {recipe.ingredients.map((ing: any, i: number) => (
                      <li key={i} className="flex flex-col gap-2 p-3 bg-white/60 rounded-2xl border border-orange-50">
                        <div className="flex justify-between items-center gap-3 w-full">
                          <div className="flex gap-2 items-center flex-1 min-w-0">
                            <span className="text-[#FF6B4A] font-bold shrink-0">•</span>
                            <span className="font-semibold text-gray-800 break-words">
                              {ing.product ? ing.product.name : (ing.ingredientName || 'Nguyên liệu')}
                            </span>
                          </div>
                          <span className="text-gray-500 font-medium text-sm whitespace-nowrap shrink-0 ml-2">{ing.quantityStr}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 italic bg-gray-50 p-6 rounded-xl border border-gray-100 mb-12">
                    Chưa có thông tin nguyên liệu chi tiết.
                  </div>
                )}
              </div>

              {/* Cột 2: Cách Làm */}
              <div className="md:col-span-3">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6 pb-2 border-b-2 border-gray-100">
                  <BookOpen className="text-[#FF6B4A]" /> Thực hiện
                </h3>
                {instructionSteps.length > 0 ? (
                  <div className="space-y-6">
                    {instructionSteps.map((step: string, index: number) => {
                      if (!step) return null;
                      return (
                        <div key={index} className="flex gap-8 group items-start">
                          <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-orange-50 text-[#FF6B4A] border border-orange-100 group-hover:bg-[#FF6B4A] group-hover:text-white transition-all duration-300 font-bold text-lg shadow-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 pt-[3px] text-gray-700 leading-[1.8] text-justify text-[16px]">
                            {step}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 italic bg-gray-50 p-6 rounded-xl border border-gray-100">
                    Chi tiết các bước thực hiện đang được cập nhật trên hệ thống.
                  </div>
                )}
              </div>
            </div>

            {/* Sản phẩm liên quan - Gợi ý mua sắm dựa trên nguyên liệu */}
            {linkedProducts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <ShoppingCart className="text-green-500" /> Tươi ngon có sẵn tại FruiTaste
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {linkedProducts.map((product: any) => {
                    const outStock = product.stockQuantity <= 0;
                    return (
                      <div key={product.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-100 transition-all flex flex-col group overflow-hidden">
                        <Link href={`/products/${product.id}`} className="relative overflow-hidden block aspect-[4/3] bg-white w-full flex-shrink-0 p-0">
                          <img
                            src={getImageUrl(product.mediaUrls?.[0] || "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80")}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover filter mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                          />
                          {outStock && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10">
                              <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Hết hàng</span>
                            </div>
                          )}
                          {!outStock && product.stockQuantity <= 20 && product.stockQuantity > 0 && (
                            <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-md z-10">
                              SẮP HẾT
                            </span>
                          )}
                        </Link>

                        <div className="p-4 flex flex-col flex-1">
                          <Link href={`/products/${product.id}`}>
                            <h4 className="text-[14px] leading-[20px] font-[600] text-gray-900 line-clamp-2 group-hover:text-green-500 transition-colors mb-2">{product.name}</h4>
                          </Link>

                          <p className="text-green-500 font-bold text-[20px] mt-auto mb-4">
                            {new Intl.NumberFormat('vi-VN').format(product.price)}
                            <span className="underline ml-0.5">đ</span>
                            <span className="text-gray-400 text-[14px] font-medium ml-1">/ {product.unit || 'kg'}</span>
                          </p>

                          <button
                            disabled={outStock}
                            onClick={() => handleAddToCart(product)}
                            className="cursor-pointer w-full flex items-center justify-center gap-1.5 text-sm font-bold py-2.5 rounded-full transition-all bg-gradient-to-br from-green-50 to-green-100 text-green-500 hover:bg-green-500 hover:text-white hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed border border-green-200 hover:border-green-500"
                          >
                            <Plus className="w-4 h-4" /> Thêm vào giỏ
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}