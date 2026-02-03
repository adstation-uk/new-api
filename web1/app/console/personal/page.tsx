import { api } from '@/lib/api'
import { PersonalClient } from './personal-client'

async function getPersonalData() {
  try {
    const [userRes, statusRes] = await Promise.all([
      api('/api/user/self'),
      api('/api/status'),
    ])

    const userJson = await userRes.json()
    const statusJson = await statusRes.json()

    return {
      user: userJson.success ? userJson.data : null,
      status: statusJson.success ? statusJson.data : null,
    }
  }
  catch (e) {
    console.error('Failed to fetch personal data', e)
    return { user: null, status: null }
  }
}

export default async function PersonalPage() {
  const { user, status } = await getPersonalData()

  if (!user) {
    // Handle edge case where user is not logged in / data fetch failed
    return <div>Loading...</div>
  }

  return <PersonalClient user={user} status={status || {}} />
}
