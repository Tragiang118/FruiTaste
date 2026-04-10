"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Clock, ChefHat, Flame, Home, ChevronRight } from "lucide-react";
import BackButton from '@/components/BackButton';

export default function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dbRecipes, setDbRecipes] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await api.get('/recipes');
        setDbRecipes(res.data);
      } catch (err) {
        console.error("Failed to load recipes", err);
      }
    };
    fetchRecipes();
  }, []);

  const fallbackRecipes = [
    { id: 1, title: "Sinh Tố Bơ Chuối", prepTime: 10, level: "Dễ", cal: "350 kcal", imageUrl: "https://images.unsplash.com/photo-1600718374662-0483d2e9da16?auto=format&fit=crop&w=400&q=80" },
    { id: 2, title: "Salad Trái Cây Kiểu Nhiệt Đới", prepTime: 15, level: "Dễ", cal: "200 kcal", imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80" },
    { id: 3, title: "Nước Ép Táo Cần Tây", prepTime: 5, level: "Trung bình", cal: "120 kcal", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80" },
    { id: 4, title: "Sữa Chua Dâu Tây Granola", prepTime: 10, level: "Dễ", cal: "280 kcal", imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=400&q=80" },
    { id: 5, title: "Trà Đào Cam Sả Giải Nhiệt", prepTime: 20, level: "Cao", cal: "150 kcal", imageUrl: "https://images.unsplash.com/photo-1595981267035-7b04d84b22c7?auto=format&fit=crop&w=400&q=80" },
    { id: 6, title: "Chè Bưởi Đậu Xanh Hương Vani", prepTime: 45, level: "Khó", cal: "400 kcal", imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80" }
  ];

  const displayRecipes = dbRecipes.length > 0 ? dbRecipes : fallbackRecipes;
  const filteredRecipes = displayRecipes.filter(r => (r.name || r.title).toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-gray-900 font-sans pb-20 pt-4 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4 mt-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 leading-tight">
            <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1"><Home size={14} /> Trang chủ</Link>
            <ChevronRight size={14} />
            <span className="text-[#FF6B4A] font-medium truncate">Góc Công Thức</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1A1A1A] mb-4 tracking-tight leading-tight">Góc Công Thức</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Sáng tạo thức uống và món tráng miệng tuyệt vời từ những loại trái cây tươi ngon nhất của FruiTaste.</p>
      </div>

      <div className="max-w-7xl mx-auto">
        
        <div className="relative max-w-md mx-auto mb-16 shadow-sm rounded-full bg-white border border-gray-100 p-1 flex items-center pr-2">
            <div className="pl-4 text-gray-400">
               <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Tìm kiếm công thức (vd: Sinh tố)..." 
              className="w-full bg-transparent border-none focus:ring-0 text-sm py-3 px-3 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="rounded-full bg-[#FF6B4A] hover:bg-[#E55A39] text-white px-6">Tìm</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe, idx) => (
            <Card key={recipe.id || idx} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group cursor-pointer bg-white">
              <div className="relative h-60 w-full overflow-hidden">
                <img 
                  src={recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"} 
                  alt={recipe.title || recipe.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#FF6B4A] shadow-sm flex items-center gap-1">
                  <Flame size={12} /> {recipe.cal || "250 kcal"}
                </div>
              </div>
              
              <CardContent className="p-6">
                 <h3 className="font-bold text-xl mb-3 group-hover:text-[#FF6B4A] transition-colors line-clamp-2">{recipe.title || recipe.name}</h3>
                 
                 <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-t border-gray-100 pt-4">
                    <span className="flex items-center gap-1.5"><Clock size={16} /> {recipe.prepTime || 15}p</span>
                    <span className="flex items-center gap-1.5"><ChefHat size={16} /> {recipe.level || "Dễ"}</span>
                 </div>
                 
                 <Link href={`/recipes/${recipe.id || idx + 1}`}>
                   <Button className="w-full rounded-2xl bg-[#FFF4E6] text-[#FF6B4A] border border-[#FFD8CD] hover:bg-[#FF6B4A] hover:text-white transition-colors">
                      Xem Chi Tiết
                   </Button>
                 </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
            <Button variant="outline" className="rounded-full border-[#FF6B4A] text-[#FF6B4A] hover:bg-[#FF6B4A] hover:text-white px-8 py-6">Tải thêm công thức</Button>
        </div>
        
      </div>
    </div>
  );
}