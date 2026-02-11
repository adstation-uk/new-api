'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ModelsTable } from './models-table'
import { ModelsSheet } from './models-sheet'
import { VendorDialog } from './vendor-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus, 
  RotateCcw,
  RefreshCw,
  Filter,
  Layers
} from 'lucide-react'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useTransition } from 'react'
import { syncUpstreamModels } from './actions'
import { toast } from 'sonner'

export function ModelsClient({ 
  data, 
  total,
  currentPage,
  vendors,
  vendorCounts
}: { 
  data: any[], 
  total: number,
  currentPage: number,
  vendors: any[],
  vendorCounts: Record<string, number>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [editingModel, setEditingModel] = React.useState<any | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isVendorDialogOpen, setIsVendorDialogOpen] = React.useState(false)
  
  const [searchValue, setSearchValue] = React.useState(searchParams.get('keyword') || '')
  const [vendorFilter, setVendorFilter] = React.useState(searchParams.get('vendor') || 'all')

  const pageSize = 10
  const totalPages = Math.ceil(total / pageSize)

  const updateSearch = (keyword: string, vendor: string, page: number = 1) => {
    const params = new URLSearchParams(searchParams)
    if (keyword) params.set('keyword', keyword)
    else params.delete('keyword')
    
    if (vendor && vendor !== 'all') params.set('vendor', vendor)
    else params.delete('vendor')
    
    params.set('p', page.toString())
    
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearch(searchValue, vendorFilter)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    updateSearch(searchValue, vendorFilter, newPage)
  }

  const handleReset = () => {
    setSearchValue('')
    setVendorFilter('all')
    startTransition(() => {
      router.push('/console/models')
    })
  }

  const handleSync = async () => {
    const loadingToast = toast.loading('正在同步官方模型数据...')
    try {
      const result = await syncUpstreamModels()
      if (result.success) {
        toast.success('同步成功')
      } else {
        toast.error(result.message || '同步失败')
      }
    } catch (e) {
      toast.error('网络请求失败')
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row justify-between gap-4 bg-muted/30 p-4 rounded-xl border">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索模型名称、别名或标签..."
              className="pl-8 bg-background"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          
          <Select value={vendorFilter} onValueChange={(v) => { setVendorFilter(v); updateSearch(searchValue, v); }}>
            <SelectTrigger className="w-[180px] bg-background">
              <Filter className="w-3.5 h-3.5 mr-2 opacity-50" />
              <SelectValue placeholder="所有供应商" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有供应商 ({total})</SelectItem>
              {vendors.map(v => (
                <SelectItem key={v.id} value={v.id.toString()}>
                  {v.name} ({vendorCounts[v.id] || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button type="submit" size="sm" className="h-10 px-4">搜索</Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="h-10 w-10 p-0">
               <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-10 border-dashed" onClick={handleSync}>
                <RefreshCw className="mr-2 h-4 w-4" /> 同步官方
            </Button>
            <Button variant="outline" size="sm" className="h-10" onClick={() => setIsVendorDialogOpen(true)}>
                <Layers className="mr-2 h-4 w-4" /> 管理供应商
            </Button>
            <Button size="sm" className="h-10" onClick={() => { setEditingModel(null); setIsSheetOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> 新增模型
            </Button>
        </div>
      </div>

      <VendorDialog 
        open={isVendorDialogOpen} 
        onOpenChange={setIsVendorDialogOpen} 
        vendors={vendors}
      />

      <ModelsTable 
        data={data} 
        vendors={vendors} 
        onEdit={(m) => { setEditingModel(m); setIsSheetOpen(true); }} 
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          共 {total} 个模型，当前第 {currentPage} / {totalPages || 1} 页
        </div>
        <div className="flex items-center space-x-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> 上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isPending}
          >
            下一页 <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <ModelsSheet 
        model={editingModel} 
        vendors={vendors}
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
      />
    </div>
  )
}
