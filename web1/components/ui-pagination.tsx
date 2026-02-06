'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type PaginationProps = {
  page: number
  total: number
  pageSize: number
}

export function Pagination({ page, total, pageSize }: PaginationProps) {
  const router = useRouter()
  const totalPages = Math.ceil(total / pageSize)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set('p', newPage.toString())
    router.push(`${window.location.pathname}?${params.toString()}`)
  }

  const handlePageSizeChange = (newSize: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set('size', newSize)
    params.set('p', '1')
    router.push(`${window.location.pathname}?${params.toString()}`)
  }

  if (total === 0)
    return null

  return (
    <div className="p-4 border-t flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground flex items-center gap-4">
        <span>
          共 {total} 条数据，第 {page} / {totalPages || 1} 页
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs">每页</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              {[10, 15, 20, 50, 100].map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => handlePageChange(page - 1)}
        >
          上一页
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => handlePageChange(page + 1)}
        >
          下一页
        </Button>
      </div>
    </div>
  )
}
