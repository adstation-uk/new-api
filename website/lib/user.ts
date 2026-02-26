'use server'

import { redirect } from '@/i18n/navigation'
import { api } from '@/lib/api'

export type UserInfo = {
  id: number
  username: string
  role: number
  quota: number
  status: number
  // Add more fields here if needed.
}

/**
 * Get current logged-in user information.
 * Redirects to login when unauthenticated or session is invalid.
 * Redirects to /forbidden when role is insufficient.
 * Intended for Server Components.
 */
export async function getUserInfo(minRole: number = 1): Promise<UserInfo> {
  const res = await api('/api/user/self')

  if (res.status === 401) {
    // Handle authentication failure and redirect to login.
    redirect('/login')
  }

  if (!res.ok) {
    const text = await res.text()
    console.error(`Status ${res.status}: ${text}`)
    // Handle non-401 errors by redirecting to login.
    redirect('/login')
  }

  const data = await res.json()
  if (!data.success) {
    redirect('/login')
  }

  const user = data.data

  // Role guard: Admin is 10, regular user is usually 1.
  if (user.role < minRole) {
    redirect('/forbidden')
  }

  return user
}

/**
 * Get current logged-in user information optionally.
 * Returns null without redirecting when unauthenticated.
 */
export async function getOptionalUserInfo(): Promise<UserInfo | null> {
  try {
    const res = await api('/api/user/self')
    if (!res.ok)
      return null
    const data = await res.json()
    if (!data.success)
      return null
    return data.data
  }
  catch {
    return null
  }
}
