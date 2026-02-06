import { Pagination } from '@/components/ui-pagination'
import { Card } from '@/components/ui/card'
import { api, getSession } from '@/lib/api'
import { LogSearch } from './log-search'
import { LogTable } from './log-table'

async function getLogs(params: {
  page: number
  pageSize: number
  query: { [key: string]: string | undefined }
}) {
  try {
    const query = new URLSearchParams({
      p: (params.page - 1).toString(),
      size: params.pageSize.toString(),
    })

    Object.entries(params.query).forEach(([key, value]) => {
      if (value) {
        query.set(key, value)
      }
    })

    const res = await api(`/api/log/?${query.toString()}`)
    const data = await res.json()

    if (data.success && data.data) {
      return {
        items: data.data.items || [],
        total: data.data.total || 0,
      }
    }
  }
  catch (e) {
    console.error('Failed to fetch logs', e)
  }
  return { items: [], total: 0 }
}

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{
    p?: string
    size?: string
    token_name?: string
    model_name?: string
    type?: string
    channel?: string
    username?: string
    group?: string
    start_timestamp?: string
    end_timestamp?: string
  }>
}) {
  const params = await searchParams
  const page = Number.parseInt(params.p || '1')
  const pageSize = Number.parseInt(params.size || '15')

  const session = await getSession()
  const isAdmin = (session?.user?.role || 0) >= 10

  const { items, total } = await getLogs({
    page,
    pageSize,
    query: {
      token_name: params.token_name,
      model_name: params.model_name,
      type: params.type,
      channel: params.channel,
      username: params.username,
      group: params.group,
      start_timestamp: params.start_timestamp,
      end_timestamp: params.end_timestamp,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">使用日志</h1>
        </div>

        <Card className="p-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b">
            <LogSearch isAdmin={isAdmin} />
          </div>

          <LogTable data={items} isAdmin={isAdmin} />

          <Pagination page={page} total={total} pageSize={pageSize} />
        </Card>
      </div>
    </div>
  )
}
