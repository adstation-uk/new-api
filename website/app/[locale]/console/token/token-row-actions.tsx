'use client'

import { Copy, Edit, Eye, EyeOff, Play, Square, Trash2 } from 'lucide-react'
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
import { deleteToken, toggleTokenStatus } from './actions'
import { TokenDrawer } from './token-drawer'

export function TokenKey({ token }: { token: { key: string, id: number } }) {
  const t = useTranslations('Page.Console.Token.row')
  const [showKey, setShowKey] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('copied'))
    }
    catch {
      toast.error(t('copyFailed'))
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
  const t = useTranslations('Page.Console.Token.row')
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleDelete = async () => {
    const res = await deleteToken(token.id)
    if (res.success) {
      toast.success(t('deleteSuccess'))
      router.refresh()
    }
    else {
      toast.error(res.message || t('deleteFailed'))
    }
  }

  const handleToggleStatus = async () => {
    const newStatus = token.status === 1 ? 2 : 1
    const res = await toggleTokenStatus(token.id, newStatus)
    if (res.success) {
      toast.success(newStatus === 1 ? t('enabled') : t('disabled'))
      router.refresh()
    }
    else {
      toast.error(res.message || t('actionFailed'))
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 hover:bg-muted"
        onClick={handleToggleStatus}
        title={token.status === 1 ? t('disable') : t('enable')}
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
            <AlertDialogTitle>{t('confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDescription', { name: token.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('confirmDelete')}
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
