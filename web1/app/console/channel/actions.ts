'use server'

import { api } from '@/lib/api'
import { revalidatePath } from 'next/cache'

export async function toggleChannelStatus(id: number, targetStatus: number) {
  const res = await api('/api/channel/', {
    method: 'PUT',
    body: JSON.stringify({ id, status: targetStatus }),
    headers: { 'Content-Type': 'application/json' },
  })
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/channel')
  }
  return result
}

export async function updateChannelField(id: number, field: string, value: any) {
  // First get current channel to avoid overwriting everything with defaults
  const getRes = await api(`/api/channel/${id}`)
  const getData = await getRes.json()
  if (!getData.success) return getData

  const updatedChannel = { ...getData.data, [field]: value }
  const res = await api('/api/channel/', {
    method: 'PUT',
    body: JSON.stringify(updatedChannel),
    headers: { 'Content-Type': 'application/json' },
  })
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/channel')
  }
  return result
}

export async function deleteChannel(id: number) {
  const res = await api(`/api/channel/${id}`, { method: 'DELETE' })
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/channel')
  }
  return result
}

export async function batchDeleteChannels(ids: number[]) {
  const res = await api('/api/channel/batch', {
    method: 'POST',
    body: JSON.stringify({ ids }),
    headers: { 'Content-Type': 'application/json' },
  })
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/channel')
  }
  return result
}

export async function batchSetTag(ids: number[], tag: string) {
  const res = await api('/api/channel/batch/tag', {
    method: 'POST',
    body: JSON.stringify({ ids, tag }),
    headers: { 'Content-Type': 'application/json' },
  })
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/channel')
  }
  return result
}

export async function testChannel(id: number, model?: string, endpointType?: string) {
  let url = `/api/channel/test/${id}`
  const params = new URLSearchParams()
  if (model) params.append('model', model)
  if (endpointType) params.append('endpoint_type', endpointType)
  
  const queryString = params.toString()
  if (queryString) {
    url += `?${queryString}`
  }

  const res = await api(url)
  const result = await res.json()
  if (result.success && !model) {
    revalidatePath('/console/channel')
  }
  return result
}

export async function testAllChannels() {
  const res = await api('/api/channel/test')
  return await res.json()
}

export async function updateAllBalances() {
  const res = await api('/api/channel/update_balance')
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/channel')
  }
  return result
}

export async function updateChannelBalance(id: number) {
  const res = await api(`/api/channel/update_balance/${id}`)
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/channel')
  }
  return result
}

export async function fixChannelAbilities() {
  const res = await api('/api/channel/fix', { method: 'POST' })
  return await res.json()
}

export async function deleteDisabledChannels() {
  const res = await api('/api/channel/disabled', { method: 'DELETE' })
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/channel')
  }
  return result
}

export async function saveChannel(channel: any) {
  const isEdit = !!channel.id
  const method = isEdit ? 'PUT' : 'POST'
  const res = await api('/api/channel/', {
    method,
    body: JSON.stringify(channel),
    headers: { 'Content-Type': 'application/json' },
  })
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/channel')
  }
  return result
}

export async function fetchChannelModels(channel: any) {
  const res = await api('/api/channel/fetch_models', {
    method: 'POST',
    body: JSON.stringify(channel),
    headers: { 'Content-Type': 'application/json' },
  })
  return await res.json()
}

export async function fetchChannelModelsById(id: number) {
  const res = await api(`/api/channel/fetch_models/${id}`)
  return await res.json()
}
