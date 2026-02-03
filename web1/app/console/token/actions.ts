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
  const name = formData.get('name') as string
  const expire_time = formData.get('expire_time') as string // in seconds? or date string? Usually API takes timestamp or -1
  const remain_quota = Number.parseFloat(formData.get('remain_quota') as string)
  const unlimited_quota = formData.get('unlimited_quota') === 'true'

  // API expects:
  // {
  //   name: string,
  //   expired_time: number (timestamp in seconds, or -1),
  //   remain_quota: number,
  //   unlimited_quota: boolean
  // }

  // Note: Standard API usually handles expiration logic.
  // If undefined/empty, usually treated as -1 (never).

  let expired_time = -1
  if (expire_time) {
    // Assuming inputs send a value.
    // If it's a date string, convert to timestamp.
    // But form inputs usually give YYYY-MM-DD
    // Helper in client will likely send standard types.
    expired_time = Number.parseInt(expire_time)
  }

  try {
    const res = await api('/api/token', {
      method: 'POST',
      body: JSON.stringify({
        name,
        expired_time,
        remain_quota,
        unlimited_quota,
      }),
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

export async function updateToken(_id: number, _data: any) {
  // To be implemented
}
