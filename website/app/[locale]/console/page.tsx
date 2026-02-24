import { LayoutDashboard } from 'lucide-react'
import { AnnouncementsPanel } from '@/components/dashboard/announcements-panel'
import { ApiInfoPanel } from '@/components/dashboard/api-info-panel'
import { ChartsPanel } from '@/components/dashboard/charts-panel'
import { RefreshButton } from '@/components/dashboard/refresh-button'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { api } from '@/lib/api'
import { processDashboardData } from '@/lib/dashboard-utils'

async function getDashboardData() {
  try {
    const [userRes, quotaRes, statusRes] = await Promise.all([
      api('/api/user/self'),
      api('/api/data/self/?default_time=today'),
      api('/api/status'),
    ])

    const userJson = await userRes.json()
    const quotaJson = await quotaRes.json()
    const statusJson = await statusRes.json()

    const userData = userJson.success ? userJson.data : null
    const quotaData = quotaJson.success ? quotaJson.data || [] : []
    const statusData = statusJson.success ? statusJson.data : null

    return {
      user: userData,
      quotaData,
      status: statusData,
    }
  }
  catch (e) {
    console.error('Failed to fetch dashboard data', e)
    return {
      user: null,
      quotaData: [],
      status: null,
    }
  }
}

export default async function DashboardPage() {
  const { user, quotaData, status } = await getDashboardData()
  const processedChartData = processDashboardData(quotaData)

  const todayQuota = Array.isArray(quotaData)
    ? quotaData.reduce((acc, curr) => acc + (curr?.quota || 0), 0)
    : 0
  const todayTimes = Array.isArray(quotaData)
    ? quotaData.reduce((acc, curr) => acc + (curr?.count || 0), 0)
    : 0

  const dashboardStats = {
    quota: user?.quota || 0,
    today_quota: todayQuota,
    times: user?.request_count || 0,
    today_times: todayTimes,
    trend: processedChartData.trend,
  }

  const announcementsRaw = status?.announcements || status?.status?.announcements || []
  const announcements = Array.isArray(announcementsRaw)
    ? announcementsRaw.map((item: any, index: number) => ({
        content: item?.content || item?.description || '',
        time: item?.publishDate || item?.created_at || `公告 ${index + 1}`,
        type: item?.type || 'info',
        extra: item?.extra,
      }))
    : status?.notice
      ? [{ content: status.notice, time: '当前', type: 'info' }]
      : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">数据看板</h2>
            <p className="text-sm text-muted-foreground">
              欢迎回来，
              {user?.username || '用户'}
              。这是您的账户活跃情况概览。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
        </div>
      </div>

      {/* Basic Stats */}
      <StatsCards data={dashboardStats} loading={false} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApiInfoPanel />
        <AnnouncementsPanel data={announcements} loading={false} />
      </div>

      <ChartsPanel data={processedChartData} loading={false} />
    </div>
  )
}
