import { Home, ChevronRight, Clock, FileJson, Terminal } from "lucide-react";
import BackButton from '@/components/BackButton';
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFFDFB] text-gray-900 font-sans pb-20">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full mb-8 mt-4">
            <BackButton className="px-0 h-auto mb-0" />
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1 font-medium"><Home size={14} /> Trang chủ</Link>
                <ChevronRight size={14} />
                <span className="text-[#FF6B4A] font-medium truncate">Về chúng tôi</span>
            </div>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 text-center mt-12 mb-16">
        <span className="text-[#FF6B4A] font-mono text-xs uppercase tracking-widest font-black mb-3 block flex items-center justify-center gap-1.5">
          <Terminal size={14} /> system_info.sh
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Về FruiTaste</h1>
        <p className="text-gray-500 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
          Khám phá câu chuyện khởi nghiệp, sứ mệnh kết nối nông sản Việt và các cam kết cốt lõi được cấu trúc và quản lý bởi đội ngũ lập trình viên FruiTaste.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Editor Window Mockup */}
        <div className="bg-[#0D1117] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl font-mono text-[12px] md:text-sm text-gray-300">
          {/* Editor Title Bar */}
          <div className="bg-[#161B22] px-6 py-4 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
            </div>
            <span className="text-gray-400 text-xs font-bold flex items-center gap-1.5">
              <FileJson size={14} className="text-yellow-500" /> about.json
            </span>
            <span className="text-gray-600 text-xs hidden sm:inline">JSON</span>
          </div>
          
          {/* Editor Body */}
          <div className="p-6 md:p-8 overflow-x-auto leading-relaxed flex select-none">
            {/* Line Numbers */}
            <div className="text-gray-600 text-right pr-6 border-r border-gray-800 shrink-0 hidden sm:block">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            
            {/* Code Content */}
            <div className="pl-6 flex-1 text-left whitespace-pre font-mono">
              <span className="text-gray-500">// Thông tin cấu hình dự án FruiTaste</span>{"\n"}
              <span className="text-purple-400">{"{"}</span>{"\n"}
              {"  "}<span className="text-blue-400">"name"</span>: <span className="text-green-300">"FruiTaste"</span>,{"\n"}
              {"  "}<span className="text-blue-400">"established"</span>: <span className="text-orange-300">2024</span>,{"\n"}
              {"  "}<span className="text-blue-400">"mission"</span>: <span className="text-green-300">"Kết nối trực tiếp nông sản sạch tới người tiêu dùng"</span>,{"\n"}
              {"  "}<span className="text-blue-400">"coreValues"</span>: <span className="text-purple-400">[</span>{"\n"}
              {"    "}<span className="text-green-300">"100% Hữu cơ & Tươi sạch (VietGAP/GlobalGAP)"</span>,{"\n"}
              {"    "}<span className="text-green-300">"Vận chuyển siêu tốc, đảm bảo độ tươi mới"</span>,{"\n"}
              {"    "}<span className="text-green-300">"Không chất bảo quản, tuyệt đối an toàn"</span>{"\n"}
              {"  "}<span className="text-purple-400">]</span>,{"\n"}
              {"  "}<span className="text-blue-400">"metrics"</span>: <span className="text-purple-400">{"{"}</span>{"\n"}
              {"    "}<span className="text-blue-400">"activeCustomers"</span>: <span className="text-green-300">"100+"</span>,{"\n"}
              {"    "}<span className="text-blue-400">"qualityStandardRatio"</span>: <span className="text-green-300">"100%"</span>{"\n"}
              {"  "}<span className="text-purple-400">{"}"}</span>{"\n"}
              <span className="text-purple-400">{"}"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* README.md section */}
      <div className="max-w-4xl mx-auto px-4 mt-16 font-sans">
        <div className="border-t border-gray-100 pt-12">
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 font-mono">
              <span className="text-gray-400">#</span> README.md
            </h2>
            
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 mt-8 flex items-center gap-2 font-mono">
              <span className="text-gray-400">##</span> 1. Sứ mệnh của FruiTaste
            </h3>
            <p className="mb-6 text-gray-600 text-sm md:text-base">
              Thành lập từ năm 2024, FruiTaste sinh ra từ ý tưởng của những lập trình viên yêu nông sản Việt. Chúng tôi xây dựng nền tảng công nghệ giúp kết nối trực tiếp các hợp tác xã nông nghiệp sạch đến tận bàn ăn của gia đình bạn, cắt giảm mọi khâu trung gian để đem lại chất lượng tối ưu nhất.
            </p>

            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 mt-8 flex items-center gap-2 font-mono">
              <span className="text-gray-400">##</span> 2. Tiêu chuẩn cam kết
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm md:text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A]" /> Hữu cơ & Tươi sạch
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Đảm bảo trái cây luôn có nguồn gốc rõ ràng, đạt chuẩn VietGAP/GlobalGAP từ những nhà vườn tâm huyết.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm md:text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B58EB]" /> Giao hàng siêu tốc
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Quy trình đóng gói thông minh và giao nhanh khu vực nội thành, duy trì hương vị tươi ngon trọn vẹn.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm md:text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> An toàn sức khỏe
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Cam kết tuyệt đối không sử dụng các chất bảo quản độc hại, kiểm duyệt chặt chẽ trước khi giao.
                </p>
              </div>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 mt-8 flex items-center gap-2 font-mono">
              <span className="text-gray-400">##</span> 3. Thông tin liên hệ
            </h3>
            <p className="text-gray-600 text-sm md:text-base">
              Nếu bạn cần hợp tác hoặc cần giải đáp thắc mắc, vui lòng gửi phản hồi qua email của chúng tôi tại <code className="bg-gray-100 text-[#FF6B4A] px-2 py-0.5 rounded font-mono text-xs md:text-sm">support@fruitaste.page</code>.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}