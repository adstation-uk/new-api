'use client'

import { CircleDollarSign, FlaskConical, MoreVertical, Plus, Search, Tag, Trash2, Wrench, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('Page.Console.Channel.search')
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
              placeholder={t('keywordPlaceholder')}
              className="pl-8 h-9"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button size="sm" onClick={handleSearch} className="h-9">{t('search')}</Button>
        </div>

        <div className="flex items-center gap-4 border-l pl-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Label htmlFor="tag-mode" className="text-xs text-muted-foreground">{t('tagView')}</Label>
            <Switch
              id="tag-mode"
              checked={tagMode}
              onCheckedChange={onTagModeChange}
            />
          </div>

          <Select value={activeTab} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[110px] h-9">
              <SelectValue placeholder={t('status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatus')}</SelectItem>
              <SelectItem value="enabled">{t('enabled')}</SelectItem>
              <SelectItem value="disabled">{t('disabled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {selectedCount > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={onBatchTag} className="h-9 border-dashed text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100">
                <Tag className="mr-2 h-4 w-4" />
                {' '}
                {t('batchTag')}
                {' '}
                (
                {selectedCount}
                )
              </Button>
              <Button variant="outline" size="sm" onClick={onBatchDelete} className="h-9 border-dashed text-red-600 border-red-200 bg-red-50 hover:bg-red-100">
                <Trash2 className="mr-2 h-4 w-4" />
                {' '}
                {t('batchDelete')}
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <MoreVertical className="mr-2 h-4 w-4" />
                {' '}
                {t('more')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onTestAll}>
                <FlaskConical className="mr-2 h-4 w-4" />
                {' '}
                {t('testAll')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onUpdateBalances}>
                <CircleDollarSign className="mr-2 h-4 w-4" />
                {' '}
                {t('updateAllBalance')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onFixAbilities}>
                <Wrench className="mr-2 h-4 w-4" />
                {' '}
                {t('fixDb')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeleteDisabled} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <XCircle className="mr-2 h-4 w-4" />
                {' '}
                {t('deleteDisabled')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" className="h-9 bg-green-600 hover:bg-green-700" onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {' '}
            {t('addChannel')}
          </Button>
        </div>
      </div>
    </div>
  )
}
