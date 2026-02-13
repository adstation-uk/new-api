import { api } from '@/lib/api'
import { ModelsClient } from './models-client'

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
