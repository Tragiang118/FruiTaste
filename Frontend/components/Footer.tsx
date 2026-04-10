import { Leaf, Phone, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-24 text-gray-600 font-sans">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 p-8 rounded-3xl shadow-lg">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-green-400 rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900">Frui<span className="text-primary">Taste</span></span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Cửa hàng hoa quả tươi ngon, giao hàng nhanh chóng, mang hương vị thiên nhiên đến tận tay bạn. Chúng tôi cam kết chất lượng và sự hài lòng của khách hàng là ưu tiên hàng đầu.
            </p>
            <div className="flex flex-col gap-2 items-start">
              <div className="flex gap-2">
                <span className="text-xs bg-gray-50 px-2.5 py-1 rounded-full text-gray-400 font-semibold border">🌿 Tươi ngon</span>
                <span className="text-xs bg-gray-50 px-2.5 py-1 rounded-full text-gray-400 font-semibold border">💰 Giá tốt</span>
              </div>
              <span className="text-xs bg-gray-50 px-2.5 py-1 rounded-full text-gray-400 font-semibold border">🕒 Giao hàng nhanh</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4 ">Phân loại</h3>
            <ul className="space-y-2.5 text-sm font-semibold">
              {['Trái cây theo mùa', 'Trái cây nhiệt đới', 'Trái cây nhập khẩu', 'Trái cây đặc sản vùng miền'].map((l, i) => (
                <li key={i}>
                  <Link href="/products" className="hover:text-primary transition-colors text-gray-500">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links / Help */}
          <div>
            <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4">Hỗ trợ</h3>
            <ul className="space-y-2.5 text-sm font-semibold">
              {[
                { href: '/products', label: 'Tất cả sản phẩm' },
                { href: '/orders', label: 'Theo dõi đơn hàng' },
                { href: '/recipes', label: ' Công thức nấu ăn' },
                { href: '#', label: 'Chính sách bảo mật' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary transition-colors text-gray-500">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm font-semibold text-gray-500">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>0978513301</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>micucai2711@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>85 Khương Thượng, Đống Đa,Hà Nội</span>
              </li>
            </ul>
          </div>
        </div>
      

        <div className="mt-12 mb-12 text-sm text-gray-400 flex flex-col md:flex-row justify-center items-center gap-2">
          <p>© 2026 FruiTaste - Hoa quả tươi mới mỗi ngày.</p>
        </div>
      </div>
    </footer>
  )
}
