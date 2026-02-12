import { api } from '@/lib/api'
import { fetchVendors } from './actions'
import { ModelsClient } from './models-client'

async function getModels(searchParams: { [key: string]: string | string[] | undefined }) {
  const params = new URLSearchParams()
  let hasKeyword = false

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      const val = Array.isArray(value) ? value[0] : String(value)
      params.append(key, val)
      if ((key === 'keyword' || key === 'vendor') && val)
        hasKeyword = true
    }
  })

  if (!params.has('p'))
    params.set('p', '1')

  const endpoint = hasKeyword ? '/api/models/search' : '/api/models/'

  try {
    const res = await api(`${endpoint}?${params.toString()}`, {
      cache: 'no-store',
    })
    const data = await res.json()
    if (data.success && data.data) {
      return {
        models: data.data.items || [],
        total: data.data.total || 0,
        page: Number.parseInt(params.get('p') || '1'),
        vendorCounts: data.data.vendor_counts || {},
      }
    }
    return { models: [], total: 0, page: 1, vendorCounts: {} }
  }
  catch (error) {
    console.error('Failed to fetch models:', error)
    return { models: [], total: 0, page: 1, vendorCounts: {} }
  }
}

export default async function ModelsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const [{ models, total, page, vendorCounts }, vendors] = await Promise.all([
    getModels(resolvedSearchParams),
    fetchVendors(),
  ])

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">模型库</h1>
          <p className="text-muted-foreground mt-1">
            浏览与管理系统中支持的所有 AI 模型。
          </p>
        </div>
      </div>

      <ModelsClient
        data={models}
        total={total}
        currentPage={page}
        vendors={vendors}
        vendorCounts={vendorCounts}
      />
    </div>
  )
}
