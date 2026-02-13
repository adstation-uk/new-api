'use client'

import { Copy, Trash2 } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { deleteToken } from './actions'
import { TokenSearch } from './token-search'
import { TokenTable } from './token-table'

export function TokenContainer({
  data,
  keyword,
  token,
}: {
  data: any[]
  keyword: string
  token: string
}) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const router = useRouter()

  const selectedIds = Object.keys(rowSelection)
    .filter(key => rowSelection[key])
    .map(key => Number.parseInt(key))

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0)
      return

    let successCount = 0
    for (const id of selectedIds) {
      const res = await deleteToken(id)
      if (res.success)
        successCount++
    }

    if (successCount > 0) {
      toast.success(`成功删除 ${successCount} 个令牌`)
      setRowSelection({})
      router.refresh()
    }
  }

  const handleBulkCopy = async () => {
    if (selectedIds.length === 0)
      return
    const keys = data
      .filter(t => selectedIds.includes(t.id))
      .map(t => `sk-${t.key}`)
      .join('\n')

    try {
      await navigator.clipboard.writeText(keys)
      toast.success(`已复制 ${selectedIds.length} 个令牌密钥`)
    }
    catch {
      toast.error('复制失败')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleBulkCopy}
            disabled={selectedIds.length === 0}
            className="h-9"
          >
            <Copy className="mr-2 h-4 w-4" />
            复制所选
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={selectedIds.length === 0}
                className="h-9 text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除所选
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除</AlertDialogTitle>
                <AlertDialogDescription>
                  确定删除选中的
                  {' '}
                  {selectedIds.length}
                  {' '}
                  个令牌吗？此操作无法撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBulkDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  确认删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <TokenSearch initialKeyword={keyword} initialToken={token} />
      </div>

      <TokenTable
        data={data}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </div>
  )
}
