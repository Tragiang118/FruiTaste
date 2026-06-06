$pfile = 'C:\Đồ án tốt nghiệp\FruiTaste\frontend\app\products\page.tsx'
$ptext = Get-Content $pfile -Raw
$pnew = '<div className="relative w-full md:w-80">
                <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
                <Input
                    type="search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm kiếm trái cây..."
                    className="bg-white pl-11 pr-4 py-6 rounded-full border border-gray-200 shadow-sm focus-visible:ring-green-400 focus-visible:ring-2 w-full text-base font-medium"
                />
            </div>'
$ptext = $ptext -replace '(?s)<div className="relative w-full md:w-80">.*?</div>', $pnew
[System.IO.File]::WriteAllText($pfile, $ptext, [System.Text.Encoding]::UTF8)

$rfile = 'C:\Đồ án tốt nghiệp\FruiTaste\frontend\app\recipes\page.tsx'
$rtext = Get-Content $rfile -Raw
$rtext = $rtext -replace 'import \{ Input \} from `@/components/ui/input`;\r?\n', ''
$rtext = $rtext.Replace('import { Button } from "@/components/ui/button";', "import { Button } from `"@/components/ui/button`";`nimport { Input } from `"@/components/ui/input`";")
[System.IO.File]::WriteAllText($rfile, $rtext, [System.Text.Encoding]::UTF8)