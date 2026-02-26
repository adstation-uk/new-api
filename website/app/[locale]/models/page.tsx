import type { Metadata } from 'next'
import { getModelMetadata, modelConfig } from '@/config/models'
import { buildPageMetadata } from '@/lib/seo'
import { ModelsClient } from './models-client'

type Props = {
  params: Promise<{ locale: string }>
}

export const dynamic = 'force-static'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === 'zh'

  return buildPageMetadata({
    locale,
    pathname: '/models',
    title: isZh ? '模型广场' : 'Model Hub',
    description: isZh
      ? '按模型类别与厂商浏览可用 AI 模型，快速对比能力与接入方式。'
      : 'Explore available AI models by provider and category, and compare capabilities for fast integration.',
    keywords: isZh
      ? ['模型广场', 'AI 模型', '模型列表', 'OpenAI 兼容']
      : ['AI models', 'model catalog', 'LLM model list', 'OpenAI-compatible models'],
  })
}

function toStaticModels() {
  return Object.keys(modelConfig).map((id) => {
    const metadata = getModelMetadata(id)
    const price = Number.parseFloat((metadata.price || '$0').replace('$', ''))

    return {
      model_name: id,
      vendor_name: metadata.provider || 'Other',
      tags: [metadata.category, metadata.provider].filter(Boolean).join(','),
      quota_type: metadata.billing_type === 'request' ? 1 : 0,
      model_price: Number.isFinite(price) ? Math.round(price * 500000) : 0,
      model_ratio: Number.isFinite(price) ? price / 2 : 0,
      completion_ratio: 1,
      enable_groups: ['default'],
    }
  })
}

export default async function ModelsPage() {
  const models = toStaticModels()
  const groupRatio = { default: 1 }
  const status = {
    quota_display_type: 'USD',
    price: 1,
    usd_exchange_rate: 1,
    custom_currency_exchange_rate: 1,
    custom_currency_symbol: '$',
  }

  return (
    <ModelsClient
      initialModels={models}
      initialGroupRatio={groupRatio}
      initialStatus={status}
    />
  )
}
