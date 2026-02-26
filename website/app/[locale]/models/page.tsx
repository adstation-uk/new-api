import type { Metadata } from 'next'
import { api } from '@/lib/api'
import { buildPageMetadata } from '@/lib/seo'
import { ModelsClient } from './models-client'

type Props = {
  params: Promise<{ locale: string }>
}

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

async function getPricingData() {
  const [pricingRes, statusRes] = await Promise.all([
    api('/api/pricing'),
    api('/api/status'),
  ])

  let models = []
  let groupRatio = {}
  let status = {}

  try {
    const pricingJson = await pricingRes.json()
    if (pricingJson.success) {
      models = pricingJson.data || []
      groupRatio = pricingJson.group_ratio || {}
    }
  }
  catch (e) {
    console.error('Failed to parse pricing data', e)
  }

  try {
    const statusJson = await statusRes.json()
    if (statusJson.success) {
      status = statusJson.data || {}
    }
  }
  catch (e) {
    console.error('Failed to parse status data', e)
  }

  return { models, groupRatio, status }
}

export default async function ModelsPage() {
  const { models, groupRatio, status } = await getPricingData()

  return (
    <ModelsClient
      initialModels={models}
      initialGroupRatio={groupRatio}
      initialStatus={status}
    />
  )
}
