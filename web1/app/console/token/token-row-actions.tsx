'use client'

import { Copy, Edit, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { deleteToken } from './actions'

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

export function TokenActions({
  token,
}: {
  token: { id: number, name: string }
}) {
  const router = useRouter()

  const handleDelete = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`确认删除令牌 "${token.name}"？`))
      return
    const res = await deleteToken(token.id)
    if (res.success) {
      toast.success('删除成功')
      router.refresh()
    }
    else {
      toast.error(res.message || '删除失败')
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted">
        <Edit size={14} className="text-muted-foreground" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
      >
        <Trash2 size={14} />
      </Button>
    </div>
  )
}
