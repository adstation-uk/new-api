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

export async function toggleTokenStatus(id: number, status: number) {
  try {
    const res = await api('/api/token/?status_only=true', {
      method: 'PUT',
      body: JSON.stringify({ id, status }),
    })
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

export async function getModels() {
  try {
    const res = await api('/api/user/models')
    return await res.json()
  }
  catch {
    return { success: false, message: 'Network Error', data: [] }
  }
}

export async function getGroups() {
  try {
    const res = await api('/api/user/self/groups')
    return await res.json()
  }
  catch {
    return { success: false, message: 'Network Error', data: {} }
  }
}

export async function createToken(payload: any) {
  try {
    const res = await api('/api/token', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
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

export async function updateToken(payload: any) {
  try {
    const res = await api('/api/token', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
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
