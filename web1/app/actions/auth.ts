'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { api } from '@/lib/api'

export async function logout() {
  await api('/api/user/logout')

  // Clear session cookie
  const cookieStore = await cookies()
  cookieStore.delete('new_api_session')

  redirect('/login')
}
