'use client'

import {
  Activity,
  BarChart3,
  CreditCard,
  Zap,
} from 'lucide-react'
import * as React from 'react'
import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, renderNumber, renderQuota } from '@/lib/utils'

function MiniTrend({ data, color }: { data: any[], color: string }) {
  if (!data || data.length === 0)
    return null
  return (
    <div className="h-8 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function StatsCards({
  data,
  loading,
}: {
  data: any
  loading: boolean
}) {
  const stats = [
    {
      title: '当前余额',
      value: renderQuota(data?.quota || 0),
      icon: <CreditCard className="w-4 h-4" />,
      className: '',
      trendColor: '#3b82f6',
      subValue: '点击充值',
    },
    {
      title: '今日消耗',
      value: renderQuota(data?.today_quota || 0),
      icon: <Zap className="w-4 h-4" />,
      className: '',
      trendColor: '#f59e0b',
      trend: data?.trend?.consumeQuota,
    },
    {
      title: '今日调用',
      value: renderNumber(data?.today_times || 0),
      icon: <Activity className="w-4 h-4" />,
      className: '',
      trendColor: '#10b981',
      trend: data?.trend?.times,
    },
    {
      title: '总调用次数',
      value: renderNumber(data?.times || 0),
      icon: <BarChart3 className="w-4 h-4" />,
      className: '',
      trendColor: '#a855f7',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map(stat => (
        <Card
          key={stat.title}
          className={cn('overflow-hidden transition-all', stat.className)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className="p-2 bg-muted rounded-lg">{stat.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold tracking-tight">
                  {loading ? '...' : stat.value}
                </div>
                {stat.subValue && (
                  <p className="text-xs text-muted-foreground mt-1 cursor-pointer hover:text-primary">
                    {stat.subValue}
                  </p>
                )}
              </div>
              {!loading && stat.trend && (
                <MiniTrend
                  data={stat.trend}
                  color={stat.trendColor || '#8884d8'}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
