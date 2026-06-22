import { Leaf, Truck, ShieldCheck, Home, ChevronRight } from "lucide-react";
import BackButton from '@/components/BackButton';
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  const features = [
    { 
      icon: <Leaf className="text-[#FF6B4A]" size={28} />, 
      title: "100% Tươi sạch", 
      desc: "Trái cây tuyển chọn kỹ lưỡng đạt tiêu chuẩn VietGAP/GlobalGAP từ các hợp tác xã uy tín." 
    },
    { 
      icon: <Truck className="text-[#5B58EB]" size={28} />, 
      title: "Giao hàng nhanh", 
      desc: "Vận chuyển nhanh chóng tại khu vực nội thành đảm bảo độ tươi mới trọn vẹn nhất." 
    },
    { 
      icon: <ShieldCheck className="text-green-500" size={28} />, 
      title: "An toàn tuyệt đối", 
      desc: "Nói không với chất bảo quản độc hại, quy trình kiểm duyệt vệ sinh thực phẩm nghiêm ngặt." 
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-gray-900 font-sans pb-20">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full mb-8 mt-4">
            <BackButton className="px-0 h-auto mb-0" />
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1 font-medium">
                  <Home size={14} /> Trang chủ
                </Link>
                <ChevronRight size={14} />
                <span className="text-[#FF6B4A] font-medium truncate">Về chúng tôi</span>
            </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-[#FFF4E6]/50 rounded-[3rem] py-16 px-6 text-center border border-orange-100/50">
          <span className="text-[#FF6B4A] font-bold tracking-wider uppercase text-xs mb-3 block">
            Câu chuyện của FruiTaste
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Mang Trái Cây Sạch Đến Mọi Nhà
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Hành trình kết nối trực tiếp các nhà vườn nông sản Việt Nam tâm huyết tới bàn ăn của mọi gia đình Việt.
          </p>
        </div>
      </section>

      {/* Journey & Info */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[300px] md:h-[400px] rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100">
             <img 
               src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80" 
               alt="Nông trại FruiTaste" 
               className="w-full h-full object-cover"
             />
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Hành trình từ vườn cây đến bàn ăn
            </h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Được thành lập vào năm 2024, FruiTaste ra đời với mục tiêu đơn giản là giúp người tiêu dùng thành thị dễ dàng tiếp cận nguồn hoa quả tươi sạch, rõ ràng nguồn gốc xuất xứ. 
            </p>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Chúng tôi hợp tác chặt chẽ với các nhà vườn và hợp tác xã nông nghiệp sạch để đảm bảo thu hoạch đúng thời điểm, vận chuyển trực tiếp đến cửa hàng mà không qua bất kỳ bên trung gian nào, bảo vệ lợi ích kinh tế cho cả nông dân lẫn khách hàng.
            </p>
            
            <div className="flex gap-4 pt-2">
               <div className="p-4 bg-blue-50/50 rounded-2xl flex-1 border border-blue-100/30 text-center">
                 <h4 className="text-2xl font-black text-[#5B58EB]">100+</h4>
                 <p className="text-xs text-gray-500 font-bold mt-1">Khách hàng tin dùng</p>
               </div>
               <div className="p-4 bg-green-50/50 rounded-2xl flex-1 border border-green-100/30 text-center">
                 <h4 className="text-2xl font-black text-green-600">100%</h4>
                 <p className="text-xs text-gray-500 font-bold mt-1">Trái cây sạch tự nhiên</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {features.map((f, idx) => (
             <Card key={idx} className="border border-gray-100 shadow-sm rounded-[2rem] bg-white text-center p-6 hover:shadow-md transition-shadow">
                <CardContent className="pt-6 flex flex-col items-center">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                </CardContent>
             </Card>
           ))}
        </div>
      </section>

    </div>
  );
}