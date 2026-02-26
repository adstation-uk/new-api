'use client'

import { Copy, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
import { useRouter } from '@/i18n/navigation'
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
  const t = useTranslations('Page.Console.Token.container')
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
      toast.success(t('batchDeleteSuccess', { count: successCount }))
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
      toast.success(t('batchCopySuccess', { count: selectedIds.length }))
    }
    catch {
      toast.error(t('copyFailed'))
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
            {t('copySelected')}
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
                {t('deleteSelected')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('confirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('confirmDescription', { count: selectedIds.length })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBulkDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t('confirmDelete')}
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
