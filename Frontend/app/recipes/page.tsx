"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, Clock, ChefHat, Flame, Home, ChevronRight } from "lucide-react";
import BackButton from '@/components/BackButton';
import { getImageUrl } from '@/lib/utils';

export default function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dbRecipes, setDbRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await api.get('/recipes');
        setDbRecipes(res.data);
      } catch (err) {
        console.error("Failed to load recipes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const displayRecipes = dbRecipes;
  const filteredRecipes = displayRecipes.filter(r => (r.name || r.title)?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-gray-900 font-sans pb-20 pt-4 px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between w-full mb-8 mt-4">
           <BackButton className="px-0 h-auto mb-0" />
           <div className="flex items-center gap-2 text-sm text-gray-500">
               <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1"><Home size={14}/> Trang chủ</Link>
               <ChevronRight size={14} />
               <span className="text-[#FF6B4A] font-medium truncate">Góc Món ăn</span>
           </div>
        </div>

      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1A1A1A] mb-4 tracking-tight leading-tight">Góc Món ăn</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Sáng tạo thức uống và món tráng miệng tuyệt vời từ những loại trái cây tươi ngon nhất của FruiTaste.</p>
      </div>

      <div className="max-w-7xl mx-auto">
        
        <div className="relative max-w-sm mx-auto mb-16">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              type="search" 
              placeholder="Tìm kiếm món ăn (vd: Sinh tố)..." 
              className="w-full pl-9 pr-4 h-10 rounded-full border-gray-200 bg-white shadow-sm focus-visible:ring-1 focus-visible:ring-[#FF6B4A]/30 transition-all text-sm [&::-webkit-search-cancel-button]:cursor-pointer [&::-webkit-search-cancel-button]:[filter:grayscale(100%)_opacity(50%)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Đang tải món ăn...</div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe, idx) => (
              <Card key={recipe.id || idx} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group cursor-pointer bg-white">
                <div className="relative h-60 w-full overflow-hidden">
                    <img 
                      src={getImageUrl(recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80")} 
                      alt={recipe.title || recipe.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                </div>
                
                <CardContent className="p-6">
                   <h3 className="font-bold text-xl mb-3 group-hover:text-[#FF6B4A] transition-colors line-clamp-2">{recipe.title || recipe.name}</h3>
                   
                   <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-t border-gray-100 pt-4">
                      <span className="flex items-center gap-1.5"><Clock size={16} /> {recipe.prepTime || 15}p</span>
                      <span className="flex items-center gap-1.5"><ChefHat size={16} /> {recipe.level || "Dễ"}</span>
                   </div>
                   
                   <Link href={`/recipes/${recipe.id || idx + 1}`}>
                     <Button className="w-full rounded-2xl bg-[#FFF4E6] text-[#FF6B4A] border border-[#FFD8CD] hover:bg-[#FF6B4A] hover:text-white transition-colors cursor-pointer">
                        Xem Chi Tiết
                     </Button>
                   </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            Chưa có món ăn nào được thêm vào hệ thống. Xin vui lòng chờ cập nhật thêm nhé!
          </div>
        )}
        
      </div>
    </div>
  );
}