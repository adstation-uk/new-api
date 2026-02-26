import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { api } from '@/lib/api'
import { ChannelClient } from './channel-client'

async function getChannels(searchParams: { [key: string]: string | string[] | undefined }) {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      params.append(key, Array.isArray(value) ? value[0] : String(value))
    }
  })

  // Ensure default page size
  if (!params.has('page_size')) {
    params.set('page_size', '20')
  }
  if (!params.has('p')) {
    params.set('p', '1')
  }

  try {
    const res = await api(`/api/channel/?${params.toString()}`, {
      cache: 'no-store',
    })
    const data = await res.json()
    if (data.success && data.data) {
      return {
        channels: data.data.items || [],
        total: data.data.total || 0,
      }
    }
    return { channels: [], total: 0 }
  }
  catch (error) {
    console.error('Failed to fetch channels:', error)
    return { channels: [], total: 0 }
  }
}

export default async function ChannelPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const t = await getTranslations('Page.Console.Channel.page')
  const resolvedSearchParams = await searchParams
  const { channels, total } = await getChannels(resolvedSearchParams)

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('description')}
        </p>
      </div>

      <Suspense fallback={<div>{t('loading')}</div>}>
        <ChannelClient
          initialChannels={channels}
          total={total}
          isAdmin={true}
        />
      </Suspense>
    </div>
  )
}
