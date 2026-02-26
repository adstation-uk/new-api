'use client'

import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import * as React from 'react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from '@/i18n/navigation'
import { syncUpstreamModels } from './actions'
import { ModelsSheet } from './models-sheet'
import { ModelsTable } from './models-table'
import { VendorDialog } from './vendor-dialog'

export function ModelsClient({
  data,
  total,
  currentPage,
  vendors,
  vendorCounts,
}: {
  data: any[]
  total: number
  currentPage: number
  vendors: any[]
  vendorCounts: Record<string, number>
}) {
  const t = useTranslations('Page.Console.Models.client')
  const commonT = useTranslations('Common')
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
    if (keyword)
      params.set('keyword', keyword)
    else params.delete('keyword')

    if (vendor && vendor !== 'all')
      params.set('vendor', vendor)
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
    if (newPage < 1 || newPage > totalPages)
      return
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
    const loadingToast = toast.loading(t('toast.syncing'))
    try {
      const result = await syncUpstreamModels()
      if (result.success) {
        toast.success(t('toast.syncSuccess'))
      }
      else {
        toast.error(result.message || t('toast.syncFailed'))
      }
    }
    catch {
      toast.error(commonT('errors.network'))
    }
    finally {
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
              placeholder={t('searchPlaceholder')}
              className="pl-8 bg-background"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value)
              }}
            />
          </div>

          <Select
            value={vendorFilter}
            onValueChange={(v) => {
              setVendorFilter(v)
              updateSearch(searchValue, v)
            }}
          >
            <SelectTrigger className="w-[180px] bg-background">
              <Filter className="w-3.5 h-3.5 mr-2 opacity-50" />
              <SelectValue placeholder={t('allVendors')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {`${t('allVendors')} (${total})`}
              </SelectItem>
              {vendors.map(v => (
                <SelectItem key={v.id} value={v.id.toString()}>
                  {v.name}
                  {' '}
                  (
                  {vendorCounts[v.id] || 0}
                  )
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button type="submit" size="sm" className="h-10 px-4">{t('search')}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="h-10 w-10 p-0">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 border-dashed" onClick={handleSync}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('syncOfficial')}
          </Button>
          <Button variant="outline" size="sm" className="h-10" onClick={() => setIsVendorDialogOpen(true)}>
            <Layers className="mr-2 h-4 w-4" />
            {t('manageVendors')}
          </Button>
          <Button
            size="sm"
            className="h-10"
            onClick={() => {
              setEditingModel(null)
              setIsSheetOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('addModel')}
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
        onEdit={(m) => {
          setEditingModel(m)
          setIsSheetOpen(true)
        }}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          {t('paginationSummary', {
            total,
            page: currentPage,
            totalPages: totalPages || 1,
          })}
        </div>
        <div className="flex items-center space-x-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {commonT('action.prevPage')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isPending}
          >
            {commonT('action.nextPage')}
            <ChevronRight className="h-4 w-4 ml-1" />
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
