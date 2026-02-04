import { api } from '@/lib/api'
import { TopupClient } from './topup-client'

async function getTopupData() {
  try {
    const [userRes, topupInfoRes] = await Promise.all([
      api('/api/user/self'),
      api('/api/user/topup/info'),
    ])

    const userJson = await userRes.json()
    const topupInfoJson = await topupInfoRes.json()

    return {
      user: userJson.success ? userJson.data : null,
      topupInfo: topupInfoJson.success ? topupInfoJson.data : null,
    }
  }
  catch (e) {
    console.error('Failed to fetch topup data', e)
    return { user: null, topupInfo: null }
  }
}

export default async function TopupPage() {
  const { user, topupInfo } = await getTopupData()

  return <TopupClient user={user} topupInfo={topupInfo} />
}
