'use client'

import { Globe } from 'lucide-react'
import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type UptimeMonitor = {
  name: string
  status: 'up' | 'down' | 'pending'
  uptime?: string
  responseTime?: string
}

type UptimePanelProps = {
  data: UptimeMonitor[]
  loading: boolean
}

export function UptimePanel({ data, loading }: UptimePanelProps) {
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-500" />
          <CardTitle className="text-lg font-semibold">服务运行状态</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading
          ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse h-16 bg-muted rounded-xl" />
                ))}
              </div>
            )
          : data.length > 0
            ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.map(monitor => (
                    <div
                      key={monitor.name}
                      className="flex items-center justify-between p-4 rounded-xl border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            monitor.status === 'up'
                              ? 'bg-green-500 animate-pulse'
                              : monitor.status === 'down'
                                ? 'bg-red-500'
                                : 'bg-muted-foreground',
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{monitor.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {monitor.status === 'up' ? '运行良好' : '不可连接'}
                          </span>
                        </div>
                      </div>
                      {monitor.responseTime && (
                        <span className="text-xs font-mono text-muted-foreground">
                          {monitor.responseTime}
                          ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )
            : (
                <div className="flex flex-col items-center justify-center py-4 text-muted-foreground italic text-sm">
                  管理员尚未配置 Uptime 监控
                </div>
              )}
      </CardContent>
    </Card>
  )
}
