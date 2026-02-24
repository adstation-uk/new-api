'use client'

import { CircleDollarSign, FlaskConical, MoreVertical, Plus, Search, Tag, Trash2, Wrench, XCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useRouter } from '@/i18n/navigation'

export function ChannelSearch({
  _isAdmin,
  onBatchDelete,
  onBatchTag,
  onAdd,
  selectedCount,
  tagMode,
  onTagModeChange,
  onTestAll,
  onUpdateBalances,
  onFixAbilities,
  onDeleteDisabled,
}: {
  _isAdmin: boolean
  onBatchDelete?: () => void
  onBatchTag?: () => void
  onAdd: () => void
  selectedCount: number
  tagMode: boolean
  onTagModeChange: (val: boolean) => void
  onTestAll: () => void
  onUpdateBalances: () => void
  onFixAbilities: () => void
  onDeleteDisabled: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'all')

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (keyword)
      params.set('keyword', keyword)
    else params.delete('keyword')
    params.set('p', '1')
    router.push(`/console/channel?${params.toString()}`)
  }, [keyword, router, searchParams])

  const handleStatusChange = (val: string) => {
    setActiveTab(val)
    const params = new URLSearchParams(searchParams.toString())
    if (val === 'all')
      params.delete('status')
    else params.set('status', val)
    params.set('p', '1')
    router.push(`/console/channel?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[300px] flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索渠道名称、ID或模型..."
              className="pl-8 h-9"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button size="sm" onClick={handleSearch} className="h-9">查询</Button>
        </div>

        <div className="flex items-center gap-4 border-l pl-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Label htmlFor="tag-mode" className="text-xs text-muted-foreground">分类视图</Label>
            <Switch
              id="tag-mode"
              checked={tagMode}
              onCheckedChange={onTagModeChange}
            />
          </div>

          <Select value={activeTab} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[110px] h-9">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="enabled">已启用</SelectItem>
              <SelectItem value="disabled">已禁用</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {selectedCount > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={onBatchTag} className="h-9 border-dashed text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100">
                <Tag className="mr-2 h-4 w-4" />
                {' '}
                批量分类 (
                {selectedCount}
                )
              </Button>
              <Button variant="outline" size="sm" onClick={onBatchDelete} className="h-9 border-dashed text-red-600 border-red-200 bg-red-50 hover:bg-red-100">
                <Trash2 className="mr-2 h-4 w-4" />
                {' '}
                批量删除
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <MoreVertical className="mr-2 h-4 w-4" />
                {' '}
                更多操作
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onTestAll}>
                <FlaskConical className="mr-2 h-4 w-4" />
                {' '}
                测试所有渠道
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onUpdateBalances}>
                <CircleDollarSign className="mr-2 h-4 w-4" />
                {' '}
                更新所有余额
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onFixAbilities}>
                <Wrench className="mr-2 h-4 w-4" />
                {' '}
                修复数据库一致性
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeleteDisabled} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <XCircle className="mr-2 h-4 w-4" />
                {' '}
                删除已禁用渠道
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" className="h-9 bg-green-600 hover:bg-green-700" onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {' '}
            新建渠道
          </Button>
        </div>
      </div>
    </div>
  )
}
