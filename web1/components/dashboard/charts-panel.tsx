'use client'

import {
  Activity,
  ListOrdered,
  PieChart as PieChartIcon,
  TrendingUp,
} from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, renderNumber, renderQuota } from '@/lib/utils'

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
]

type ChartsPanelProps = {
  data: any
  loading: boolean
}

export function ChartsPanel({ data, loading }: ChartsPanelProps) {
  const [activeTab, setActiveTab] = useState('1')

  // Prepare data for charts
  // Note: Inherit mapping logic from legacy useDashboardCharts.jsx
  const pieData = data?.pieData || [{ name: '无数据', value: 1 }]
  const lineData = data?.lineData || []
  const barData = data?.barData || []

  const tabs = [
    { id: '1', label: '消耗分布', icon: <PieChartIcon className="w-4 h-4" /> },
    { id: '2', label: '消耗趋势', icon: <TrendingUp className="w-4 h-4" /> },
    { id: '3', label: '次数分布', icon: <Activity className="w-4 h-4" /> },
    { id: '4', label: '调用排行', icon: <ListOrdered className="w-4 h-4" /> },
  ]

  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-full flex items-center justify-center">加载中...</div>
      )
    }

    switch (activeTab) {
      case '1': // Pie chart for consumption
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => renderQuota(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      case '2': // Area chart for trend
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis dataKey="Time" hide />
              <YAxis tickFormatter={value => renderQuota(value)} />
              <Tooltip formatter={(value: number) => renderQuota(value)} />
              <Area
                type="monotone"
                dataKey="Usage"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      case '3': // Bar chart for distribution
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis dataKey="Model" hide />
              <YAxis />
              <Tooltip formatter={(value: number) => renderNumber(value)} />
              <Bar dataKey="Counts" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      case '4': // Horizontal Bar chart for ranking
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f0f0f0"
              />
              <XAxis type="number" />
              <YAxis
                dataKey="Model"
                type="category"
                width={80}
                style={{ fontSize: '10px' }}
              />
              <Tooltip formatter={(value: number) => renderNumber(value)} />
              <Bar dataKey="Counts" fill="#ffc658" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4 border-b">
        <div className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-semibold">模型数据分析</CardTitle>
        </div>
        <div className="flex bg-muted p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                activeTab === tab.id
                  ? 'bg-background shadow-sm text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[350px] w-full">{renderChart()}</div>
      </CardContent>
    </Card>
  )
}
