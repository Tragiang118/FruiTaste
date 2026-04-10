import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Leaf, Truck, ShieldCheck, Home, ChevronRight } from "lucide-react";
import BackButton from '@/components/BackButton';
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  const features = [
    { icon: <Leaf className="text-[#FF6B4A]" size={32} />, title: "100% Hữu cơ & Tươi sạch", desc: "Tất cả trái cây đều được tuyển chọn kỹ lượng từ các nhà vườn uy tín, đạt tiêu chuẩn VietGAP, GlobalGAP." },
    { icon: <Truck className="text-[#5B58EB]" size={32} />, title: "Giao hàng siêu tốc", desc: "Đảm bảo độ tươi ngon nhất với quy trình đóng gói và vận chuyển trong ngày tại khu vực nội thành." },
    { icon: <ShieldCheck className="text-green-500" size={32} />, title: "An toàn sức khỏe", desc: "Không sử dụng chất bảo quản, quy trình kiểm định chất lượng nghiêm ngặt trước khi đến tay người dùng." }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-gray-900 font-sans pb-20">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-end my-4 relative z-20">
          <div className="flex items-center gap-2 text-sm text-gray-500 leading-tight">
            <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1"><Home size={14} /> Trang chủ</Link>
            <ChevronRight size={14} />
            <span className="text-[#FF6B4A] font-medium truncate">Về chúng tôi</span>
          </div>
        </div>
      </div>

      <section className="relative w-full h-[400px] flex items-center justify-center overflow-hidden mb-16 rounded-b-[3rem]">
        <div className="absolute inset-0 bg-[#FFF4E6] opacity-80 z-0"></div>
        <div className="relative z-10 text-center max-w-2xl px-4">
          <span className="text-[#FF6B4A] font-bold tracking-wider uppercase text-sm mb-4 block">Câu chuyện của chúng tôi</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#1A1A1A] mb-6">Mang hương vị thiên nhiên đến ngôi nhà bạn</h1>
          <p className="text-gray-600 text-lg">FruiTaste không chỉ bán trái cây, chúng tôi trao gửi sức khỏe, sự tận tâm và tình yêu với nông sản Việt.</p>
        </div>
      </section>


      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-xl">
             <img 
               src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80" 
               alt="Nông trại FruiTaste" 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Hành trình bắt đầu từ những vườn cây chĩu quả</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Thành lập từ năm 2024, FruiTaste ra đời với sứ mệnh kết nối trực tiếp những người nông dân tâm huyết với người tiêu dùng thành thị. Chúng tôi hiểu rằng, giữa nhịp sống hối hả, tìm kiếm được nguồn thực phẩm tươi sạch, an toàn là điều vô cùng quan trọng.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Mỗi quả sầu riêng, mỗi trái măng cụt hay từng chùm nho đều trải qua quá trình lựa chọn khắt khe. Chúng tôi ký kết hợp đồng bao tiêu với các hợp tác xã nông nghiệp sạch, đảm bảo nguồn thu nhập cho nông dân và cam kết chất lượng tuyệt đối cho khách hàng.
            </p>
            <div className="flex items-center gap-4">
               <div className="text-center p-4 bg-[#EEEEFC] rounded-2xl flex-1">
                 <h4 className="text-3xl font-extrabold text-[#5B58EB]">100+</h4>
                 <p className="text-sm text-gray-600 font-medium">Khách hàng</p>
               </div>
               <div className="text-center p-4 bg-[#E6F4EA] rounded-2xl flex-1">
                 <h4 className="text-3xl font-extrabold text-green-600">100%</h4>
                 <p className="text-sm text-gray-600 font-medium">Hữu cơ</p>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
           {features.map((f, idx) => (
             <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow rounded-[2rem] bg-white text-center p-6">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
             </Card>
           ))}
        </div>
      </section>

    </div>
  );
}