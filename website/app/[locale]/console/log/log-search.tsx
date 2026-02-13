'use client'

import { endOfDay, format, startOfDay, startOfMonth, startOfWeek, subDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar as CalendarIcon, Eraser, Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export function LogSearch({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    token_name: searchParams.get('token_name') || '',
    model_name: searchParams.get('model_name') || '',
    type: searchParams.get('type') || '0',
    channel: searchParams.get('channel') || '',
    username: searchParams.get('username') || '',
    group: searchParams.get('group') || '',
  })

  // 内部状态处理日期和具体时间
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>(() => {
    const start = searchParams.get('start_timestamp')
    const end = searchParams.get('end_timestamp')
    return {
      from: start ? new Date(Number.parseInt(start) * 1000) : undefined,
      to: end ? new Date(Number.parseInt(end) * 1000) : undefined,
    }
  })

  const [startTimeStr, setStartTimeStr] = useState(() => {
    const start = searchParams.get('start_timestamp')
    return start ? format(new Date(Number.parseInt(start) * 1000), 'HH:mm:ss') : '00:00:00'
  })
  const [endTimeStr, setEndTimeStr] = useState(() => {
    const end = searchParams.get('end_timestamp')
    return end ? format(new Date(Number.parseInt(end) * 1000), 'HH:mm:ss') : '23:59:59'
  })

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '0')
        params.set(key, value)
      else params.delete(key)
    })

    if (dateRange.from) {
      const fromWithTime = new Date(dateRange.from)
      const [h, m, s] = startTimeStr.split(':').map(Number)
      fromWithTime.setHours(h || 0, m || 0, s || 0)
      params.set('start_timestamp', Math.floor(fromWithTime.getTime() / 1000).toString())
    }
    else {
      params.delete('start_timestamp')
    }

    if (dateRange.to) {
      const toWithTime = new Date(dateRange.to)
      const [h, m, s] = endTimeStr.split(':').map(Number)
      toWithTime.setHours(h || 23, m || 59, s || 59)
      params.set('end_timestamp', Math.floor(toWithTime.getTime() / 1000).toString())
    }
    else {
      params.delete('end_timestamp')
    }

    params.set('p', '1')
    router.push(`/console/log?${params.toString()}`)
  }, [filters, dateRange, startTimeStr, endTimeStr, router, searchParams])

  const handleReset = () => {
    setFilters({ token_name: '', model_name: '', type: '0', channel: '', username: '', group: '' })
    setDateRange({ from: undefined, to: undefined })
    setStartTimeStr('00:00:00')
    setEndTimeStr('23:59:59')
    router.push('/console/log')
  }

  const applyPreset = (preset: string) => {
    const now = new Date()
    let from: Date
    let to: Date = endOfDay(now)

    switch (preset) {
      case 'today':
        from = startOfDay(now)
        break
      case 'yesterday':
        from = startOfDay(subDays(now, 1))
        to = endOfDay(subDays(now, 1))
        break
      case '7days':
        from = startOfDay(subDays(now, 6))
        break
      case 'week':
        from = startOfWeek(now, { weekStartsOn: 1 })
        break
      case '30days':
        from = startOfDay(subDays(now, 29))
        break
      case 'month':
        from = startOfMonth(now)
        break
      default:
        return
    }
    setDateRange({ from, to })
    setStartTimeStr(format(from, 'HH:mm:ss'))
    setEndTimeStr(format(to, 'HH:mm:ss'))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="令牌"
          className="w-[120px] h-9"
          value={filters.token_name}
          onChange={e => setFilters(f => ({ ...f, token_name: e.target.value }))}
        />
        <Input
          placeholder="模型"
          className="w-[140px] h-9"
          value={filters.model_name}
          onChange={e => setFilters(f => ({ ...f, model_name: e.target.value }))}
        />
        <Select value={filters.type} onValueChange={v => setFilters(f => ({ ...f, type: v }))}>
          <SelectTrigger className="w-[100px] h-9">
            <SelectValue placeholder="类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">全部</SelectItem>
            <SelectItem value="1">充值</SelectItem>
            <SelectItem value="2">消费</SelectItem>
            <SelectItem value="3">管理</SelectItem>
            <SelectItem value="4">系统</SelectItem>
            <SelectItem value="5">错误</SelectItem>
            <SelectItem value="6">退款</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn('h-9 justify-start font-normal min-w-[200px]', !dateRange.from && 'text-muted-foreground')}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from
                ? (
                    dateRange.to ? `${format(dateRange.from, 'MM-dd')} ${startTimeStr} 至 ${format(dateRange.to, 'MM-dd')} ${endTimeStr}` : format(dateRange.from, 'PPP')
                  )
                : <span>选择时间范围</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b border-border flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Input size={1} className="h-8 text-xs px-2" value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''} readOnly placeholder="开始日期" />
                <Input className="h-8 text-xs px-2 w-24" value={startTimeStr} onChange={e => setStartTimeStr(e.target.value)} placeholder="00:00:00" />
              </div>
              <div className="flex items-center gap-2">
                <Input size={1} className="h-8 text-xs px-2" value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''} readOnly placeholder="结束日期" />
                <Input className="h-8 text-xs px-2 w-24" value={endTimeStr} onChange={e => setEndTimeStr(e.target.value)} placeholder="23:59:59" />
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => { setDateRange({ from: range?.from, to: range?.to }) }}
              locale={zhCN}
              numberOfMonths={2}
            />
            <div className="p-3 border-t border-border grid grid-cols-3 gap-1">
              <Button variant="ghost" size="sm" className="text-[11px] h-7" onClick={() => applyPreset('today')}>今天</Button>
              <Button variant="ghost" size="sm" className="text-[11px] h-7" onClick={() => applyPreset('yesterday')}>昨天</Button>
              <Button variant="ghost" size="sm" className="text-[11px] h-7" onClick={() => applyPreset('7days')}>近7天</Button>
              <Button variant="ghost" size="sm" className="text-[11px] h-7" onClick={() => applyPreset('week')}>本周</Button>
              <Button variant="ghost" size="sm" className="text-[11px] h-7" onClick={() => applyPreset('30days')}>近30天</Button>
              <Button variant="ghost" size="sm" className="text-[11px] h-7" onClick={() => applyPreset('month')}>本月</Button>
            </div>
          </PopoverContent>
        </Popover>

        {isAdmin && (
          <>
            <Input placeholder="渠道ID" className="w-[80px] h-9" value={filters.channel} onChange={e => setFilters(f => ({ ...f, channel: e.target.value }))} />
            <Input placeholder="用户" className="w-[100px] h-9" value={filters.username} onChange={e => setFilters(f => ({ ...f, username: e.target.value }))} />
          </>
        )}

        <div className="flex items-center gap-1 ml-auto">
          <Button size="sm" onClick={handleSearch} className="h-9 px-4">
            <Search className="mr-2 h-4 w-4" />
            {' '}
            查询
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 px-3 text-muted-foreground">
            <Eraser className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
