'use client'

import { endOfDay, format, startOfDay, startOfMonth, startOfWeek, subDays } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import { Calendar as CalendarIcon, Eraser, Search } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export function LogSearch({ isAdmin }: { isAdmin: boolean }) {
  const t = useTranslations('Page.Console.Log.search')
  const locale = useLocale()
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

  // Internal state for date and time handling.
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
          placeholder={t('token')}
          className="w-[120px] h-9"
          value={filters.token_name}
          onChange={e => setFilters(f => ({ ...f, token_name: e.target.value }))}
        />
        <Input
          placeholder={t('model')}
          className="w-[140px] h-9"
          value={filters.model_name}
          onChange={e => setFilters(f => ({ ...f, model_name: e.target.value }))}
        />
        <Select value={filters.type} onValueChange={v => setFilters(f => ({ ...f, type: v }))}>
          <SelectTrigger className="w-[100px] h-9">
            <SelectValue placeholder={t('type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">{t('all')}</SelectItem>
            <SelectItem value="1">{t('recharge')}</SelectItem>
            <SelectItem value="2">{t('consume')}</SelectItem>
            <SelectItem value="3">{t('manage')}</SelectItem>
            <SelectItem value="4">{t('system')}</SelectItem>
            <SelectItem value="5">{t('error')}</SelectItem>
            <SelectItem value="6">{t('refund')}</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn('h-9 justify-start font-normal min-w-[200px]', !dateRange.from && 'text-muted-foreground')}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from
                ? (
                    dateRange.to ? `${format(dateRange.from, 'MM-dd')} ${startTimeStr} - ${format(dateRange.to, 'MM-dd')} ${endTimeStr}` : format(dateRange.from, 'PPP')
                  )
                : <span>{t('selectRange')}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b border-border flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Input size={1} className="h-8 text-xs px-2" value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''} readOnly placeholder={t('startDate')} />
                <Input className="h-8 text-xs px-2 w-24" value={startTimeStr} onChange={e => setStartTimeStr(e.target.value)} placeholder="00:00:00" />
              </div>
              <div className="flex items-center gap-2">
                <Input size={1} className="h-8 text-xs px-2" value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''} readOnly placeholder={t('endDate')} />
                <Input className="h-8 text-xs px-2 w-24" value={endTimeStr} onChange={e => setEndTimeStr(e.target.value)} placeholder="23:59:59" />
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => { setDateRange({ from: range?.from, to: range?.to }) }}
              locale={locale === 'zh' ? zhCN : enUS}
              numberOfMonths={2}
            />
            <div className="p-3 border-t border-border grid grid-cols-3 gap-1">
              <Button variant="ghost" size="sm" className="text-[11px] h-7" onClick={() => applyPreset('today')}>{t('today')}</Button>
              <Button variant="ghost" size="sm" className="text-[11px] h-7" onClick={() => applyPreset('yesterday')}>{t('yesterday')}</Button>
              <Button variant="ghost" size="sm" className="text-[11px] h-7" onClick={() => applyPreset('7days')}>{t('last7Days')}</Button>
              <Button variant="ghost" size="sm" className="text-[11px] h-7" onClick={() => applyPreset('week')}>{t('thisWeek')}</Button>
              <Button variant="ghost" size="sm" className="text-[11px] h-7" onClick={() => applyPreset('30days')}>{t('last30Days')}</Button>
              <Button variant="ghost" size="sm" className="text-[11px] h-7" onClick={() => applyPreset('month')}>{t('thisMonth')}</Button>
            </div>
          </PopoverContent>
        </Popover>

        {isAdmin && (
          <>
            <Input placeholder={t('channelId')} className="w-[80px] h-9" value={filters.channel} onChange={e => setFilters(f => ({ ...f, channel: e.target.value }))} />
            <Input placeholder={t('user')} className="w-[100px] h-9" value={filters.username} onChange={e => setFilters(f => ({ ...f, username: e.target.value }))} />
          </>
        )}

        <div className="flex items-center gap-1 ml-auto">
          <Button size="sm" onClick={handleSearch} className="h-9 px-4">
            <Search className="mr-2 h-4 w-4" />
            {t('search')}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 px-3 text-muted-foreground">
            <Eraser className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
