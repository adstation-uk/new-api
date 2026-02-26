'use client'

import { RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export function RefreshButton() {
  const t = useTranslations('Page.Console.Dashboard')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <Button
      variant="default"
      size="sm"
      className="gap-2"
      onClick={handleRefresh}
      disabled={isPending}
    >
      <RefreshCw className={cn('w-4 h-4', isPending && 'animate-spin')} />
      {t('refresh')}
    </Button>
  )
}
