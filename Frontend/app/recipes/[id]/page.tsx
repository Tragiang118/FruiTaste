'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<any>(null);

  useEffect(() => {

    api.get(`/recipes/${id}`).then(res => setRecipe(res.data)).catch(console.error);
  }, [id]);

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-gray-900 font-sans pb-20 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between w-full mb-4 mt-2">
          <BackButton className="px-0 h-auto mb-0" />
          <div className="flex items-center gap-2 text-sm text-gray-500 leading-tight">
            <Link href="/" className="hover:text-[#FF6B4A] flex items-center gap-1"><Home size={14} /> Trang chủ</Link>
            <ChevronRight size={14} />
            <Link href="/recipes" className="hover:text-[#FF6B4A]">Góc Công Thức</Link>
            <ChevronRight size={14} />
            <span className="text-[#FF6B4A] font-medium truncate">{recipe?.name || id}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-64 mt-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold">Chi tiết công thức: {recipe?.name || id}</h1>
        </div>
      </div>
    </div>
  );
}