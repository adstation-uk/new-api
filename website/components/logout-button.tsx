'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'

export function LogoutButton() {
  const t = useTranslations('Common')
  const router = useRouter()

  const handleLogout = async () => {
    // In a real app, you would call a logout action here to clear the session cookie
    toast.info(t('toast.loggedOutSample'))
    router.push('/login')
    router.refresh()
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      {t('action.logout')}
    </Button>
  )
}
