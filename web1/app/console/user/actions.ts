'use server'

import { api } from '@/lib/api'
import { revalidatePath } from 'next/cache'

export async function manageUser(id: number, action: 'promote' | 'demote' | 'enable' | 'disable' | 'delete') {
  const res = await api(`/api/user/manage`, {
    method: 'POST',
    body: JSON.stringify({ id, action }),
    headers: { 'Content-Type': 'application/json' },
  })
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/user')
  }
  return result
}

export async function updateUser(user: any) {
  const res = await api('/api/user/', {
    method: 'PUT',
    body: JSON.stringify(user),
    headers: { 'Content-Type': 'application/json' },
  })
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/user')
  }
  return result
}

export async function createUser(user: any) {
  const res = await api('/api/user/', {
    method: 'POST',
    body: JSON.stringify(user),
    headers: { 'Content-Type': 'application/json' },
  })
  const result = await res.json()
  if (result.success) {
    revalidatePath('/console/user')
  }
  return result
}

export async function resetUserPasskey(id: number) {
  const res = await api(`/api/user/reset_passkey`, {
    method: 'POST',
    body: JSON.stringify({ id }),
    headers: { 'Content-Type': 'application/json' },
  })
  return await res.json()
}

export async function resetUserTwoFA(id: number) {
    const res = await api(`/api/user/reset_twofa`, {
      method: 'POST',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' },
    })
    return await res.json()
}
