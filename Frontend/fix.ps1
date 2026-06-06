$file = 'C:\Đồ án tốt nghiệp\FruiTaste\frontend\app\recipes\page.tsx'
$text = Get-Content $file -Raw
$text = $text.Replace('import { Button } from "@/components/ui/button";', "import { Button } from `"`@/components/ui/button`";`nimport { Input } from `"`@/components/ui/input`";")

$old = '<div className="relative max-w-md mx-auto mb-16 shadow-sm rounded-full bg-white border border-gray-100 p-1 flex items-center pr-2">
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
            <Button className="rounded-full bg-[#FF6B4A] hover:bg-[#E55A39] text-white px-6 cursor-pointer">Tìm</Button>
        </div>'

$new = '<div className="relative max-w-md mx-auto mb-16">
            <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
            <Input 
              type="search" 
              placeholder="Tìm kiếm công thức (vd: Sinh tố)..." 
              className="bg-white pl-11 pr-24 py-6 rounded-full border-gray-200 shadow-sm focus-visible:ring-[#FF6B4A] focus-visible:ring-2 w-full text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full bg-[#FF6B4A] hover:bg-[#E55A39] text-white px-6 cursor-pointer h-10">Tìm</Button>
        </div>'

$text = $text.Replace($old, $new)
[System.IO.File]::WriteAllText($file, $text, [System.Text.Encoding]::UTF8)

# Now products page
$pfile = 'C:\Đồ án tốt nghiệp\FruiTaste\frontend\app\products\page.tsx'
$ptext = Get-Content $pfile -Raw

$pold = '<div className="relative w-full md:w-80">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm kiếm trái cây..."
                    className="pl-5 pr-12 py-6 rounded-full border border-gray-200 bg-white shadow-sm focus-visible:ring-green-400 focus-visible:ring-2 w-full text-base font-medium"
                />
            </div>'

$pnew = '<div className="relative w-full md:w-80">
                <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
                <Input
                    type="search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm kiếm trái cây..."
                    className="bg-white pl-11 pr-4 py-6 rounded-full border border-gray-200 shadow-sm focus-visible:ring-green-400 focus-visible:ring-2 w-full text-sm font-medium"
                />
            </div>'

$ptext = $ptext.Replace($pold, $pnew)
[System.IO.File]::WriteAllText($pfile, $ptext, [System.Text.Encoding]::UTF8)