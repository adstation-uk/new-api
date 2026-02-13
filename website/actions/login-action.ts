'use server'

import type { SessionData } from '@/lib/session'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import { sessionOptions } from '@/lib/session'

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { success: false, message: '请输入用户名和密码' }
  }

  try {
    const response = await api('/api/user/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()

    if (data.success) {
      // 1. Set iron-session for Next.js server-side access
      const cookieStore = await cookies()
      const session = await getIronSession<SessionData>(
        cookieStore,
        sessionOptions,
      )
      session.user = {
        id: data.data.id,
        username: data.data.username,
        role: data.data.role,
      }
      await session.save()

      // 2. Forward the backend's session cookie if present
      const setCookie = response.headers.get('set-cookie')
      if (setCookie) {
        const sessionCookie = setCookie
          .split(',')
          .map(c => c.trim())
          .find(c => c.startsWith('session='))

        if (sessionCookie) {
          // Correctly extract everything after 'session='
          const cookiePart = sessionCookie.split(';')[0]
          const value = cookiePart.substring('session='.length)

          cookieStore.set('session', value, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed to lax for better compatibility
            maxAge: 30 * 24 * 60 * 60,
          })
        }
      }

      return { success: true, user: data.data }
    }
    else {
      return { success: false, message: data.message || '登录失败' }
    }
  }
  catch (error) {
    console.error('Login error:', error)
    return { success: false, message: '服务器错误，请稍后再试' }
  }
}
