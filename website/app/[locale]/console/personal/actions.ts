'use server'

import { getTranslations } from 'next-intl/server'
import { api } from '@/lib/api'

export async function generateTokenAction() {
  const t = await getTranslations('Page.Console.Personal.actions')
  try {
    const res = await api('/api/user/token')
    return await res.json()
  }
  catch {
    return { success: false, message: t('networkError') }
  }
}

export async function bindWeChatAction(code: string) {
  const t = await getTranslations('Page.Console.Personal.actions')
  try {
    const res = await api('/api/user/wechat', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: { 'Content-Type': 'application/json' },
    })
    return await res.json()
  }
  catch {
    return { success: false, message: t('networkError') }
  }
}
