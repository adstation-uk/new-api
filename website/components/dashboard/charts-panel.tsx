'use client'

import { useTranslations } from 'next-intl'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { renderQuota } from '@/lib/utils'

type ChartsPanelProps = {
  data: any
  loading: boolean
}

export function ChartsPanel({ data, loading }: ChartsPanelProps) {
  const t = useTranslations('Page.Console.Dashboard.charts')
  const chartConfig = {
    Usage: {
      label: t('usage'),
      color: 'var(--color-chart-1)',
    },
  } as const

  const chartData
    = data?.lineData?.length > 0
      ? data.lineData
      : [
          { Time: '00:00', Usage: 0 },
          { Time: '06:00', Usage: 0 },
          { Time: '12:00', Usage: 0 },
          { Time: '18:00', Usage: 0 },
          { Time: '24:00', Usage: 0 },
        ]

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base font-semibold">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 flex items-center justify-center">
        <div className="w-full h-[260px] lg:h-[300px] mx-auto my-auto">
          {loading
            ? (
                <div className="h-full flex items-center justify-center">{t('loading')}</div>
              )
            : (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart data={chartData} margin={{ top: 12, right: 12, left: 8, bottom: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="Time"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={6}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={value => renderQuota(value)}
                      width={80}
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent className="text-[11px]" formatter={value => renderQuota(Number(value))} />}
                    />
                    <Bar
                      dataKey="Usage"
                      fill="var(--color-Usage)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ChartContainer>
              )}
        </div>
      </CardContent>
    </Card>
  )
}
