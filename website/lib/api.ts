import type { SessionData } from './session'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions } from './session'

const BACKEND_URL = 'http://localhost:3000'

export async function getSession() {
  const cookieStore = await cookies()
  return await getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function api(path: string, options: RequestInit = {}) {
  let url = path
  const headers = new Headers(options.headers)

  // Server-side: call backend directly
  if (!path.startsWith('http')) {
    url = `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`
  }

  // Add New-API-User header from session
  const session = await getSession()
  if (session && session.user) {
    headers.set('New-API-User', (session.user as any).id.toString())
  }
  else {
    headers.set('New-API-User', '-1')
  }

  // Forward cookies from the incoming request
  const cookieStore = await cookies()

  // Explicitly pass through ALL cookies to the backend
  const allCookies = cookieStore
    .getAll()
    .map(c => `${c.name}=${c.value}`)
    .join('; ')
  if (allCookies) {
    headers.set('Cookie', allCookies)
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
