import { Pagination } from '@/components/ui-pagination'
import { Card } from '@/components/ui/card'
import { api } from '@/lib/api'
import { TokenCreate } from './token-create'
import { TokenContainer } from './token-container'

async function getTokens(page: number, pageSize: number, keyword: string, token: string = '') {
  try {
    const url = (keyword || token)
      ? `/api/token/search?keyword=${encodeURIComponent(keyword)}&token=${encodeURIComponent(token)}`
      : `/api/token?p=${page}&size=${pageSize}`
    const res = await api(url)
    const data = await res.json()

    if (data.success) {
      // Search response returns an array directly in data.data or data
      if (keyword || token) {
        const items = Array.isArray(data.data) ? data.data : []
        return {
          items,
          total: items.length,
        }
      }

      // Regular list response
      if (data.data && Array.isArray(data.data.items)) {
        return {
          items: data.data.items,
          total: data.data.total,
        }
      }
      else if (Array.isArray(data.data)) {
        return { items: data.data, total: data.data.length }
      }
    }
  }
  catch (e) {
    console.error('Failed to fetch tokens', e)
  }
  return { items: [], total: 0 }
}

export default async function TokenPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string, keyword?: string, token?: string }>
}) {
  const params = await searchParams
  const page = Number.parseInt(params.p || '1')
  const keyword = params.keyword || ''
  const token = params.token || ''
  const pageSize = 10

  const { items, total } = await getTokens(page, pageSize, keyword, token)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">我的令牌</h1>
          <TokenCreate />
        </div>

        <Card className="p-0 overflow-hidden shadow-sm">
          <TokenContainer data={items} keyword={keyword} token={token} />

          <Pagination page={page} total={total} pageSize={pageSize} />
        </Card>
      </div>
    </div>
  )
}
