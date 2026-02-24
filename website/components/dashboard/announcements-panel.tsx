'use client'

import { Bell, Info } from 'lucide-react'
import { marked } from 'marked'
import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Announcement = {
  content: string
  time: string
  type?: 'default' | 'info' | 'success' | 'warning' | 'error'
  extra?: string
  relative?: string
}

type AnnouncementsPanelProps = {
  data: Announcement[]
  loading: boolean
}

export function AnnouncementsPanel({
  data,
  loading,
}: AnnouncementsPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-500" />
          <CardTitle className="text-lg font-semibold">系统公告</CardTitle>
        </div>
        <div className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
          最新 20 条
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative overflow-y-auto pr-2">
          {loading
            ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-muted mt-2" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-10 bg-muted rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )
            : data.length > 0
              ? (
                  <div className="space-y-8 relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                    {data.map((item) => {
                      const htmlContent = marked.parse(item.content || '')
                      const htmlExtra = item.extra ? marked.parse(item.extra) : ''

                      return (
                        <div key={item.time} className="relative pl-6">
                          {/* dot */}
                          <div
                            className={cn(
                              'absolute left-0 top-1.5 w-[12px] h-[12px] rounded-full border-2 border-background z-10',
                              item.type === 'info'
                                ? 'bg-blue-500'
                                : item.type === 'warning'
                                  ? 'bg-orange-500'
                                  : item.type === 'error'
                                    ? 'bg-red-500'
                                    : 'bg-muted-foreground',
                            )}
                          />

                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">
                              {item.time}
                              {' '}
                              {item.relative && `(${item.relative})`}
                            </span>
                            <div
                              className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground/90 leading-relaxed"
                              // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
                              dangerouslySetInnerHTML={{ __html: htmlContent }}
                            />
                            {item.extra && (
                              <div
                                className="mt-2 p-2 rounded bg-muted/50 text-[11px] text-muted-foreground"
                                // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
                                dangerouslySetInnerHTML={{ __html: htmlExtra }}
                              />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Info className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">暂无系统公告</p>
                  </div>
                )}
        </div>
      </CardContent>
    </Card>
  )
}
