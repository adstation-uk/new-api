'use server'

import { redirect } from 'next/navigation'
import { api } from '@/lib/api'

export type UserInfo = {
  id: number
  username: string
  role: number
  quota: number
  status: number
  // 可以根据需要添加更多字段
}

/**
 * 获取当前登录用户信息
 * 如果未登录或 Session 过效，将直接重定向至登录页
 * 如果权限不足，将重定向至 /forbidden
 * 适用于服务端组件 (Server Components)
 */
export async function getUserInfo(minRole: number = 1): Promise<UserInfo> {
  const res = await api('/api/user/self')

  if (res.status === 401) {
    // 处理 401 鉴权失败，带上过期参数以防止中间件循环重定向
    redirect('/login')
  }

  if (!res.ok) {
    const text = await res.text()
    console.error(`Status ${res.status}: ${text}`)
    // 其他非 401 错误也可以统一处理，或者根据需求展示错误页
    redirect('/login')
  }

  const data = await res.json()
  if (!data.success) {
    redirect('/login')
  }

  const user = data.data

  // 权限检查: Admin 为 10，普通用户通常为 1
  if (user.role < minRole) {
    redirect('/forbidden')
  }

  return user
}

/**
 * 获取当前登录用户信息（可选）
 * 如果未登录，返回 null，而不重定向
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
