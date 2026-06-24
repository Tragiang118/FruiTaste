'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProfileInfo from "@/components/profile/ProfileInfo";
import { useAuthStore } from "@/lib/store";
import { Home, ChevronRight, User, MapPin } from 'lucide-react';
import Link from 'next/link';

function ProfileContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const currentTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(currentTab);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/profile?tab=${tab}`, { scroll: false });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileInfo user={user} activeTab="profile" />;
      case 'address':
        return <ProfileInfo user={user} activeTab="address" />;
      default:
        return <ProfileInfo user={user} activeTab="profile" />;
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Tài khoản & Bảo mật', icon: <User size={18} /> },
    { id: 'address', label: 'Địa chỉ của tôi', icon: <MapPin size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F6FBF6] pb-20 px-4 md:px-0">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-4">
        <div className="flex items-center justify-end w-full mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1"><Home size={14} /> Trang chủ</Link>
                <ChevronRight size={14} />
                <span className="text-[#FF6B4A] font-medium truncate">Thông tin cá nhân</span>
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar / Drawer */}
        <aside className="w-full md:w-72 shrink-0 relative md:sticky md:top-28">
          <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-50">
            <div className="p-4 mb-2">
              <h2 className="text-xl font-black text-gray-900 leading-tight">Cài đặt tài khoản</h2>
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${
                    activeTab === item.id 
                    ? 'bg-green-50 text-green-600 shadow-sm shadow-green-600/5' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`${activeTab === item.id ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.icon}
                  </div>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
