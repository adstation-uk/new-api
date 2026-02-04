'use client'

import { Copy, Edit, Eye, EyeOff, Play, Square, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { deleteToken, toggleTokenStatus } from './actions'
import { TokenDrawer } from './token-drawer'

export function TokenKey({ token }: { token: { key: string, id: number } }) {
  const [showKey, setShowKey] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('已复制到剪切板')
    }
    catch {
      toast.error('复制失败')
    }
  }

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {showKey
        ? `sk-${token.key}`
        : `sk-${token.key.substring(0, 4)}***${token.key.substring(token.key.length - 4)}`}
      <button
        onClick={() => setShowKey(!showKey)}
        className="hover:text-primary transition-colors cursor-pointer"
      >
        {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
      <button
        onClick={() => copyToClipboard(`sk-${token.key}`)}
        className="hover:text-primary transition-colors cursor-pointer"
      >
        <Copy size={12} />
      </button>
    </div>
  )
}

export function TokenActions({ token }: { token: any }) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleDelete = async () => {
    const res = await deleteToken(token.id)
    if (res.success) {
      toast.success('删除成功')
      router.refresh()
    }
    else {
      toast.error(res.message || '删除失败')
    }
  }

  const handleToggleStatus = async () => {
    const newStatus = token.status === 1 ? 2 : 1
    const res = await toggleTokenStatus(token.id, newStatus)
    if (res.success) {
      toast.success(newStatus === 1 ? '已启用' : '已禁用')
      router.refresh()
    }
    else {
      toast.error(res.message || '操作失败')
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 hover:bg-muted"
        onClick={handleToggleStatus}
        title={token.status === 1 ? '禁用' : '启用'}
      >
        {token.status === 1
          ? (
              <Square size={14} className="text-muted-foreground" />
            )
          : (
              <Play size={14} className="text-muted-foreground" />
            )}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 hover:bg-muted"
        onClick={() => setIsEditOpen(true)}
      >
        <Edit size={14} className="text-muted-foreground" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={14} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定删除令牌 &quot;{token.name}&quot; 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TokenDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        editingToken={token}
      />
    </div>
  )
}
