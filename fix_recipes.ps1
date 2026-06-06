$file = 'C:\Đồ án tốt nghiệp\FruiTaste\frontend\app\recipes\page.tsx'
$text = Get-Content $file -Raw

$oldImport = 'import { Button } from "@/components/ui/button";'
$newImport = "import { Button } from `"`@/components/ui/button`";`r`nimport { Input } from `"`@/components/ui/input`";"
$text = $text.Replace($oldImport, $newImport)

$oldBlock = '<div className="relative max-w-md mx-auto mb-16 shadow-sm rounded-full bg-white border border-gray-100 p-1 flex items-center pr-2">
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

$newBlock = '<div className="relative max-w-md mx-auto mb-16">
            <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Tìm kiếm công thức (vd: Sinh tố)..." 
              className="bg-white pl-11 pr-24 py-6 rounded-full border-gray-200 shadow-sm focus-visible:ring-[#FF6B4A] focus-visible:ring-2 w-full text-base font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full bg-[#FF6B4A] hover:bg-[#E55A39] text-white px-6 cursor-pointer h-9">Tìm</Button>
        </div>'

$text = $text.Replace($oldBlock, $newBlock)
[System.IO.File]::WriteAllText($file, $text, [System.Text.Encoding]::UTF8)