'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  batchDeleteChannels,
  batchSetTag,
  deleteDisabledChannels,
  fixChannelAbilities,
  testAllChannels,
  updateAllBalances,
} from './actions'
import { ChannelSearch } from './channel-search'
import { ChannelSheet } from './channel-sheet'
import { ChannelTable } from './channel-table'
import { ModelTestDialog } from './model-test-dialog'

export function ChannelClient({
  initialChannels,
  total: initialTotal,
  isAdmin,
}: {
  initialChannels: any[]
  total: number
  isAdmin: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [tagMode, setTagMode] = useState(searchParams.get('tag_mode') === 'true')

  // Tag dialog state
  const [showTagDialog, setShowTagDialog] = useState(false)
  const [newTag, setNewTag] = useState('')

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingChannel, setEditingChannel] = useState<any>(null)

  // Test Dialog state
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [testingChannel, setTestingChannel] = useState<any>(null)

  const pageSize = 20
  const currentPage = Number.parseInt(searchParams.get('p') || '1')

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('p', p.toString())
    router.push(`/console/channel?${params.toString()}`)
  }

  const handleTagModeChange = (val: boolean) => {
    setTagMode(val)
    const params = new URLSearchParams(searchParams.toString())
    if (val)
      params.set('tag_mode', 'true')
    else params.delete('tag_mode')
    params.set('p', '1')
    router.push(`/console/channel?${params.toString()}`)
  }

  const onBatchDelete = async () => {
    if (!selectedIds.length)
      return
    // eslint-disable-next-line no-alert
    if (!window.confirm(`确定要删除选中的 ${selectedIds.length} 个渠道吗？`))
      return

    const res = await batchDeleteChannels(selectedIds)
    if (res.success) {
      toast.success(`成功删除 ${selectedIds.length} 个渠道`)
      setSelectedIds([])
      router.refresh()
    }
    else {
      toast.error(res.message || '批量删除失败')
    }
  }

  const onBatchTag = async () => {
    if (!selectedIds.length || !newTag)
      return
    const res = await batchSetTag(selectedIds, newTag)
    if (res.success) {
      toast.success('批量设置标签成功')
      setShowTagDialog(false)
      setNewTag('')
      setSelectedIds([])
      router.refresh()
    }
    else {
      toast.error(res.message || '批量设置失败')
    }
  }

  const onTestAll = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('确定要测试所有通道吗？'))
      return
    toast.info('正在启动全量测试...')
    const res = await testAllChannels()
    if (res.success) {
      toast.success('全量测试任务已启动')
      router.refresh()
    }
    else {
      toast.error(res.message || '启动测试失败')
    }
  }

  const onUpdateBalances = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('确定要更新所有通道余额吗？'))
      return
    toast.info('正在更新余额...')
    const res = await updateAllBalances()
    if (res.success) {
      toast.success('余额更新成功')
      router.refresh()
    }
    else {
      toast.error(res.message || '更新失败')
    }
  }

  const onFixAbilities = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('确定要修复数据库一致性吗？'))
      return
    const res = await fixChannelAbilities()
    if (res.success) {
      toast.success('数据库修复成功')
      router.refresh()
    }
    else {
      toast.error(res.message || '修复失败')
    }
  }

  const onDeleteDisabled = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('确定要删除所有已禁用的渠道吗？此操作不可逆！'))
      return
    const res = await deleteDisabledChannels()
    if (res.success) {
      toast.success('已删除所有禁用渠道')
      router.refresh()
    }
    else {
      toast.error(res.message || '删除失败')
    }
  }

  const handleEdit = (channel: any) => {
    setEditingChannel(channel)
    setSheetOpen(true)
  }

  const handleAdd = () => {
    setEditingChannel(null)
    setSheetOpen(true)
  }

  const handleTest = (channel: any) => {
    setTestingChannel(channel)
    setTestDialogOpen(true)
  }

  const totalPages = Math.ceil(initialTotal / pageSize)

  return (
    <div className="flex flex-col gap-6">
      <ChannelSearch
        isAdmin={isAdmin}
        onBatchDelete={onBatchDelete}
        onBatchTag={() => setShowTagDialog(true)}
        onAdd={handleAdd}
        selectedCount={selectedIds.length}
        tagMode={tagMode}
        onTagModeChange={handleTagModeChange}
        onTestAll={onTestAll}
        onUpdateBalances={onUpdateBalances}
        onFixAbilities={onFixAbilities}
        onDeleteDisabled={onDeleteDisabled}
      />

      <div className="relative">
        <ChannelTable
          data={initialChannels}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          onEdit={handleEdit}
          onTest={handleTest}
        />
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1
              if (totalPages > 7) {
                if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={currentPage === p}
                        onClick={() => handlePageChange(p)}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }
                else if (p === 2 || p === totalPages - 1) {
                  return <PaginationEllipsis key={p} />
                }
                return null
              }

              return (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={currentPage === p}
                    onClick={() => handlePageChange(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量设置标签</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>标签名称</Label>
              <Input
                placeholder="名称..."
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onBatchTag()}
              />
              <p className="text-xs text-muted-foreground">
                将选中的
                {selectedIds.length}
                {' '}
                个渠道设置为此标签
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>取消</Button>
            <Button onClick={onBatchTag} disabled={!newTag}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Sheet */}
      <ChannelSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingChannel={editingChannel}
        onSuccess={() => {
          setSheetOpen(false)
          setEditingChannel(null)
          router.refresh()
        }}
      />

      {/* Model Test Dialog */}
      <ModelTestDialog
        open={testDialogOpen}
        onOpenChange={setTestDialogOpen}
        channel={testingChannel}
      />
    </div>
  )
}
