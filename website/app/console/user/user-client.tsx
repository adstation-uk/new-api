'use client'

import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  UserPlus,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserSheet } from './user-sheet'
import { UserTable } from './user-table'

export function UserClient({
  data,
  total,
  currentPage,
  pageSize,
}: {
  data: any[]
  total: number
  currentPage: number
  pageSize: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [editingUser, setEditingUser] = React.useState<any | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState(searchParams.get('keyword') || '')

  const totalPages = Math.ceil(total / pageSize)

  const updateSearch = (keyword: string, page: number = 1) => {
    const params = new URLSearchParams(searchParams)
    if (keyword) {
      params.set('keyword', keyword)
    }
    else {
      params.delete('keyword')
    }
    params.set('p', page.toString())

    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearch(searchValue)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages)
      return
    updateSearch(searchValue, newPage)
  }

  const handleReset = () => {
    setSearchValue('')
    startTransition(() => {
      router.push('/console/user')
    })
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setIsSheetOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户名、显示名或备注..."
              className="pl-8"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">搜索</Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </form>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => { setEditingUser(null); setIsSheetOpen(true) }}>
            <UserPlus className="mr-2 h-4 w-4" />
            {' '}
            添加用户
          </Button>
        </div>
      </div>

      <UserTable data={data} onEdit={handleEdit} />

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          共
          {' '}
          {total}
          {' '}
          个用户，当前第
          {' '}
          {currentPage}
          {' '}
          /
          {' '}
          {totalPages || 1}
          {' '}
          页
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
          >
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isPending}
          >
            下一页
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <UserSheet
        user={editingUser}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  )
}
