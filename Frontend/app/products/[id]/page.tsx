'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingCart, CreditCard, ChevronRight, Home, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useCartStore, useAuthStore } from '@/lib/store';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number | string>(1);
  const { addItem } = useCartStore();

  useEffect(() => {
    api.get(`/products/${id}`)
       .then(res => {
          setProduct(res.data);
          setLoading(false);
       })
       .catch(err => {
          console.error(err);
          setLoading(false);
       });
  }, [id]);

  const handleDecrease = () => {
    const q = Number(quantity) || 1;
    if (q > 1) setQuantity(q - 1);
  };

  const handleIncrease = () => {
    const q = Number(quantity) || 1;
    if (product && q < product.stockQuantity) {
      setQuantity(q + 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setQuantity('');
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      if (product && num > product.stockQuantity) setQuantity(product.stockQuantity);
      else setQuantity(num);
    }
  };

  const handleBlur = () => {
    const q = Number(quantity);
    if (!q || q < 1) setQuantity(1);
  };

  const handleAddToCart = () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: Number(quantity) || 1,
        image: (product.images && product.images.length > 0) ? product.images[0] : 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
        stockQuantity: product.stockQuantity
      });
    }
  };

  const handleBuyNow = () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    handleAddToCart();
    
  };

  if (loading) {
     return <div className="min-h-screen flex justify-center items-center bg-[#FFFDFB]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B4A]"></div></div>;
  }

  if (!product) {
     return <div className="min-h-screen flex justify-center items-center bg-[#FFFDFB]"><h2 className="text-xl">Không tìm thấy sản phẩm.</h2></div>;
  }

  const imageUrl = (product.images && product.images.length > 0) ? product.images[0] : 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-gray-900 font-sans pb-24 pt-8">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between w-full mb-8 mt-4">
             <BackButton className="px-0 h-auto mb-0" />
             <div className="flex items-center gap-2 text-sm text-gray-500">
                 <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1"><Home size={14}/> Trang chủ</Link>
                 <ChevronRight size={14} />
                 <Link href="/products" className="hover:text-[#FF6B4A]">Trái cây</Link>
                 <ChevronRight size={14} />
                 <span className="text-[#FF6B4A] font-medium truncate">{product.name}</span>
             </div>
          </div>

          <div className="flex flex-col md:flex-row gap-12 lg:gap-16 mb-16">

             <div className="w-full md:w-1/2 flex-shrink-0">
                <div className="bg-[#FFF4E6] rounded-[3rem] p-8 aspect-square flex items-center justify-center relative overflow-hidden group shadow-sm border border-orange-50">
                   <img src={imageUrl} alt={product.name} className="w-full h-full object-cover filter drop-shadow-xl group-hover:scale-105 transition-transform duration-500 rounded-[2rem]" />
                   {product.stockQuantity <= 0 && (
                      <div className="absolute top-6 left-6 bg-red-500 text-white font-bold px-4 py-1.5 rounded-full shadow-md text-sm tracking-wide">
                         Hết hàng
                      </div>
                   )}
                </div>
             </div>

             <div className="w-full md:w-1/2 flex flex-col justify-center">
                {product.category && <div className="text-sm font-bold tracking-wider text-[#FF6B4A] uppercase mb-2">{product.category.name}</div>}
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#1A1A1A] mb-4 leading-tight">{product.name}</h1>
                
                <div className="flex items-end gap-3 mb-6">
                   <span className="text-3xl md:text-4xl font-black text-green-500">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                   </span>
                   <span className="text-lg text-gray-500 mb-1">/ {product.unit || 'kg'}</span>
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed line-clamp-3">
                   {product.description || "Một loại trái cây tươi ngon, giàu vitamin và khoáng chất, rất tốt cho sức khỏe của bạn và gia đình. Sản phẩm được thu hoạch và bảo quản cẩn thận để giữ trọn vẹn hương vị tự nhiên."}
                </p>

                <div className="space-y-6 bg-white p-6 rounded-3xl  mb-6">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium text-base">Tình trạng:</span>
                      {product.stockQuantity > 0 ? (
                         <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-base">Còn {product.stockQuantity} {product.unit || 'kg'}</span>
                      ) : (
                         <span className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full text-base">Hết hàng</span>
                      )}
                   </div>

                   <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium text-base">Đã chọn:</span>
                      <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-100">
                         <button onClick={handleDecrease} disabled={Number(quantity) <= 1} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-50">
                            <Minus size={18} />
                         </button>
                         <input 
                            type="text" 
                            className="w-12 text-center font-bold text-lg bg-transparent border-none outline-none focus:ring-0 p-0 text-gray-900"
                            value={quantity}
                            onChange={handleQuantityChange}
                            onBlur={handleBlur}
                         />
                         <button onClick={handleIncrease} disabled={Number(quantity) >= product.stockQuantity || product.stockQuantity === 0} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-50">
                            <Plus size={18} />
                         </button>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                   <Button onClick={handleAddToCart} disabled={product.stockQuantity <= 0} className="flex-1 py-7 rounded-full bg-gradient-to-br from-green-50 to-green-100 text-green-500 hover:bg-green-500 hover:text-white border border-green-500 hover:border-green-600 focus:ring-0 text-lg font-bold shadow-none transition-colors">
                      <ShoppingCart size={22} className="mr-2" /> Thêm vào giỏ
                   </Button>
                   <Button onClick={handleBuyNow} disabled={product.stockQuantity <= 0} className="flex-1 py-7 rounded-full bg-[#FF6B4A] hover:bg-[#E55A39] text-white text-lg font-bold shadow-md shadow-orange-200 transition-colors">
                      <CreditCard size={22} className="mr-2" /> Mua ngay
                   </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
                   <div className="flex flex-col items-center justify-center text-center gap-2">
                      <div className="w-12 h-12 bg-[#E6F4EA] text-green-600 rounded-full flex items-center justify-center"><ShieldCheck size={24}/></div>
                      <span className="text-xs font-medium text-gray-600">100% Rõ nguồn gốc</span>
                   </div>
                   <div className="flex flex-col items-center justify-center text-center gap-2">
                      <div className="w-12 h-12 bg-[#EEEEFC] text-[#5B58EB] rounded-full flex items-center justify-center"><Truck size={24}/></div>
                      <span className="text-xs font-medium text-gray-600">Giao nhanh 2h</span>
                   </div>
                   <div className="flex flex-col items-center justify-center text-center gap-2">
                      <div className="w-12 h-12 bg-[#FFF4E6] text-[#FF6B4A] rounded-full flex items-center justify-center"><RefreshCcw size={24}/></div>
                      <span className="text-xs font-medium text-gray-600">Đổi trả 1-1</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.05)] border border-gray-50">
             <h2 className="text-2xl font-extrabold mb-6 border-b border-gray-100 pb-4 inline-block text-[#1A1A1A]">Mô tả sản phẩm</h2>
             <div className="prose max-w-none text-gray-600 leading-loose text-lg">
                {product.description ? (
                   <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
                ) : (
                   <>
                      <p className="mb-4">
                         {product.name} là loại trái cây tươi ngon được tuyển chọn kỹ lưỡng từ các vườn trồng đạt tiêu chuẩn VietGAP/GlobalGAP. Chúng tôi cam kết không sử dụng chất bảo quản, giữ nguyên hương vị tự nhiên và giá trị dinh dưỡng cao nhất khi đến tay khách hàng.
                      </p>
                      <ul className="list-disc pl-5 mt-4 space-y-2">
                         <li>Nguồn gốc xuất xứ rõ ràng, minh bạch thông tin nông trại.</li>
                         <li>Tuyển chọn cẩn thận từng quả, đảm bảo độ tươi mới và chín tự nhiên.</li>
                         <li>Đóng gói cẩn thận, bao bì thân thiện với môi trường.</li>
                         <li>Rất giàu Vitamin nhóm B, Vitamin C và chất xơ, thích hợp dùng mỗi ngày để tăng cường sức khoẻ hoặc làm quà biếu tặng.</li>
                      </ul>
                   </>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}