$file = 'C:\Đồ án tốt nghiệp\FruiTaste\frontend\app\recipes\page.tsx'
$raw = Get-Content $file -Raw
$idx = $raw.IndexOf('<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">')
if ($idx -eq -1) { $idx = $raw.IndexOf('<div className="grid') }
$top = $raw.Substring(0, $idx)
$bottom = @"
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe, idx) => (
            <Card key={recipe.id || idx} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group cursor-pointer bg-white relative">
              <Link href={\/recipes/\ + (recipe.id || idx + 1)} className="absolute inset-0 z-10">
                <span className="sr-only">Xem Chi Tiết</span>
              </Link>
              
              <div className="relative h-60 w-full overflow-hidden">
                <img 
                  src={recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"} 
                  alt={recipe.title || recipe.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#FF6B4A] shadow-sm flex items-center gap-1 z-20">
                  <Flame size={12} /> {recipe.cal || "250 kcal"}
                </div>
              </div>
              
              <CardContent className="p-6 relative z-0">
                 <h3 className="font-bold text-xl mb-3 group-hover:text-[#FF6B4A] transition-colors line-clamp-2">{recipe.title || recipe.name}</h3>
                 
                 <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-t border-gray-100 pt-4">
                    <span className="flex items-center gap-1.5"><Clock size={16} /> {recipe.prepTime || 15}p</span>
                    <span className="flex items-center gap-1.5"><ChefHat size={16} /> {recipe.level || "Dễ"}</span>
                 </div>
                 
                 <Button className="w-full rounded-2xl bg-[#FFF4E6] text-[#FF6B4A] border border-[#FFD8CD] hover:bg-[#FF6B4A] hover:text-white transition-colors relative z-20 pointer-events-auto">
                    Xem Chi Tiết
                 </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
            <Button variant="outline" className="rounded-full border-[#FF6B4A] text-[#FF6B4A] hover:bg-[#FF6B4A] hover:text-white px-8 py-6 pointer-events-auto">Tải thêm công thức</Button>
        </div>
        
      </div>
    </div>
  );
}