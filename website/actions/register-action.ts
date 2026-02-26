'use server'

import { getTranslations } from 'next-intl/server'
import { api } from '@/lib/api'

export async function registerAction(formData: FormData) {
  const t = await getTranslations('Common')
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const password2 = formData.get('password2') as string
  const aff_code = formData.get('aff_code') as string

  if (!username || !password || !password2) {
    return { success: false, message: t('errors.fillRequired') }
  }

  if (password !== password2) {
    return { success: false, message: t('errors.passwordMismatch') }
  }

  try {
    const response = await api('/api/user/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        confirm_password: password2,
        aff_code,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()

    if (data.success) {
      return { success: true, message: t('toast.registerSuccess') }
    }
    else {
      return { success: false, message: data.message || t('toast.registerFailed') }
    }
  }
  catch (error) {
    console.error('Register error:', error)
    return { success: false, message: t('errors.serverTryLater') }
  }
}
