'use server'

import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'
import { redirect } from '@/i18n/navigation'
import { api } from '@/lib/api'

export async function getOAuthStateAction() {
  const t = await getTranslations('Common')
  try {
    const res = await api('/api/oauth/state')
    return await res.json()
  }
  catch {
    return { success: false, message: t('errors.network') }
  }
}

export async function logout(locale: string) {
  await api('/api/user/logout')

  // Clear session cookie
  const cookieStore = await cookies()
  cookieStore.delete('new_api_session')

  redirect({ href: '/login', locale })
}
