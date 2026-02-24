'use client'

import { ExternalLink, Terminal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { API_BASE_URL } from '@/config/models'

type ApiInfoPanelProps = {
  apiKey?: string
}

export function ApiInfoPanel({ apiKey: _apiKey }: ApiInfoPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-purple-500" />
          <CardTitle className="text-lg font-semibold">快速开始</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/console/token"
              className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted transition-colors group"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold">管理令牌</span>
                <span className="text-[10px] text-muted-foreground">
                  创建和分配额度
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>

            <a
              href="https://docs.newapi.pro"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted transition-colors group"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold">官方文档</span>
                <span className="text-[10px] text-muted-foreground">
                  查看集成教程
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-accent/50 border">
            <h4 className="text-xs font-bold text-primary mb-1 uppercase">
              配置基地址
            </h4>
            <p className="text-xs text-foreground/80 leading-relaxed font-mono">
              Base URL:
              {' '}
              {API_BASE_URL}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
