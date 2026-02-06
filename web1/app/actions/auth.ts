'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { api } from '@/lib/api'

export async function getOAuthStateAction() {
  try {
    const res = await api('/api/oauth/state')
    return await res.json()
  }
  catch {
    return { success: false, message: '网络错误' }
  }
}

export async function logout() {
  await api('/api/user/logout')

  // Clear session cookie
  const cookieStore = await cookies()
  cookieStore.delete('new_api_session')

  redirect('/login')
}
