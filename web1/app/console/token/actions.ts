'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'

export async function deleteToken(id: number) {
  try {
    const res = await api(`/api/token/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      revalidatePath('/console/token')
    }
    return data
  }
  catch {
    return { success: false, message: 'Network Error' }
  }
}

export async function createToken(prevState: any, formData: FormData) {
  const payload = {
    name: formData.get('name') as string,
    unlimited_quota: formData.get('unlimited_quota') === 'true',
    remain_quota: Number.parseInt(
      (formData.get('remain_quota') as string) || '0',
    ),
    expired_time: Number.parseInt(
      (formData.get('expired_time') as string) || '-1',
    ),
    model_limits_enabled: formData.get('model_limits_enabled') === 'true',
    model_limits: (formData.get('model_limits') as string) || '',
    allow_ips: (formData.get('allow_ips') as string) || '',
    group: (formData.get('group') as string) || '',
    cross_group_retry: formData.get('cross_group_retry') === 'true',
  }

  try {
    const res = await api('/api/token', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (data.success) {
      // If tokenCount > 1, the backend might only support one at a time via this endpoint
      // The original project handles multiple creation by calling the API multiple times or having a different endpoint?
      // Let's check backend AddToken in controller/token.go
      revalidatePath('/console/token')
      return { success: true, message: '' }
    }
    return { success: false, message: data.message }
  }
  catch {
    return { success: false, message: 'Network Error' }
  }
}

export async function updateToken(id: number, formData: FormData) {
  const payload = {
    id,
    name: formData.get('name') as string,
    unlimited_quota: formData.get('unlimited_quota') === 'true',
    remain_quota: Number.parseInt(
      (formData.get('remain_quota') as string) || '0',
    ),
    expired_time: Number.parseInt(
      (formData.get('expired_time') as string) || '-1',
    ),
    model_limits_enabled: formData.get('model_limits_enabled') === 'true',
    model_limits: (formData.get('model_limits') as string) || '',
    allow_ips: (formData.get('allow_ips') as string) || '',
    group: (formData.get('group') as string) || '',
    cross_group_retry: formData.get('cross_group_retry') === 'true',
  }

  try {
    const res = await api('/api/token', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (data.success) {
      revalidatePath('/console/token')
      return { success: true, message: '' }
    }
    return { success: false, message: data.message }
  }
  catch {
    return { success: false, message: 'Network Error' }
  }
}
