'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'

export async function manageModel(id: number, action: 'delete' | 'sync' | 'enable' | 'disable') {
  if (action === 'delete') {
    const res = await api(`/api/models/${id}`, {
      method: 'DELETE',
    })
    const result = await res.json()
    if (result.success) {
      revalidatePath('/console/models')
    }
    return result
  }

  // Custom status update if needed, but current API might suggest using PUT
  return { success: false, message: 'Not implemented' }
}

export async function saveModel(model: any) {
  const method = model.id ? 'PUT' : 'POST'
  const endpoint = '/api/models/'

  const res = await api(endpoint, {
    method,
    body: JSON.stringify(model),
    headers: { 'Content-Type': 'application/json' },
  })
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/models')
  }
  return result
}

export async function fetchVendors() {
  try {
    const res = await api('/api/vendors/', { cache: 'no-store' })
    const data = await res.json()
    return data.success ? data.data.items : []
  }
  catch {
    return []
  }
}

export async function syncUpstreamModels() {
  const res = await api('/api/models/sync_upstream', {
    method: 'POST',
  })
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/models')
  }
  return result
}

export async function saveVendor(vendor: any) {
  const method = vendor.id ? 'PUT' : 'POST'
  const res = await api('/api/vendors/', {
    method,
    body: JSON.stringify(vendor),
    headers: { 'Content-Type': 'application/json' },
  })
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/models')
  }
  return result
}

export async function deleteVendor(id: number) {
  const res = await api(`/api/vendors/${id}`, {
    method: 'DELETE',
  })
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/models')
  }
  return result
}
