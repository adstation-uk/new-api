'use server'

import { api } from '@/lib/api'

export async function generateTokenAction() {
  try {
    const res = await api('/api/user/token')
    return await res.json()
  }
  catch {
    return { success: false, message: '网络错误' }
  }
}

export async function bindWeChatAction(code: string) {
  try {
    const res = await api('/api/user/wechat', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: { 'Content-Type': 'application/json' },
    })
    return await res.json()
  }
  catch {
    return { success: false, message: '网络错误' }
  }
}
