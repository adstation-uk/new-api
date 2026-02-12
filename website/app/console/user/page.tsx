import { Suspense } from 'react'
import { api } from '@/lib/api'
import { UserClient } from './user-client'

async function getUsers(searchParams: { [key: string]: string | string[] | undefined }) {
  const params = new URLSearchParams()
  let hasKeyword = false

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      const val = Array.isArray(value) ? value[0] : String(value)
      params.append(key, val)
      if (key === 'keyword' && val)
        hasKeyword = true
    } 
  })

  // Backend uses 'p' for page index (1-based)
  if (!params.has('p'))
    params.set('p', '1')

  const endpoint = hasKeyword ? '/api/user/search' : '/api/user/'

  try {
    const res = await api(`${endpoint}?${params.toString()}`, {
      cache: 'no-store',
    })
    const data = await res.json()
    if (data.success && data.data) {
      return {
        users: data.data.items || [],
        total: data.data.total || 0,
        page: Number.parseInt(params.get('p') || '1'),
      }
    }
    return { users: [], total: 0, page: 1 }
  }
  catch (error) {
    console.error('Failed to fetch users:', error)
    return { users: [], total: 0, page: 1 }
  }
}

export default async function UserPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const { users, total, page } = await getUsers(resolvedSearchParams)

  return (
    <div >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">用户管理</h1>
        <p className="text-muted-foreground mt-1">
          管理系统用户信息、额度以及权限。
        </p>
      </div>

      <UserClient
        data={users}
        total={total}
        currentPage={page}
        pageSize={10}
      />
    </div>
  )
}
