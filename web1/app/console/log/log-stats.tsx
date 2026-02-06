'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { renderQuota } from '@/lib/utils'

export function LogStats({ isAdmin }: { isAdmin: boolean }) {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<{ quota: number; rpm: number; tpm: number } | null>(null)
  const searchParams = useSearchParams()

  const fetchStats = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams(searchParams.toString())
      const endpoint = isAdmin ? '/api/log/stat' : '/api/log/self/stat'
      const res = await fetch(`${endpoint}?${query.toString()}`)
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (e) {
      console.error('Failed to fetch stats', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (show) {
      fetchStats()
    }
  }, [show, searchParams])

  if (!show) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShow(true)}
        className="text-muted-foreground h-9 border-dashed"
        title="计算当前筛选条件下的总消耗、RPM和TPM"
      >
        <Eye className="mr-2 h-4 w-4" />
        聚合当前统计
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-md border border-border">
      <Button variant="ghost" size="sm" onClick={() => setShow(false)} className="text-muted-foreground p-0 h-6 w-6">
        <EyeOff className="h-3 w-3" />
      </Button>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : stats ? (
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 whitespace-nowrap">
            消耗额度: {renderQuota(stats.quota)}
          </Badge>
          <Badge variant="secondary" className="bg-orange-50 text-orange-600 dark:bg-orange-900/20 whitespace-nowrap">
            RPM: {stats.rpm}
          </Badge>
          <Badge variant="secondary" className="bg-purple-50 text-purple-600 dark:bg-purple-900/20 whitespace-nowrap">
            TPM: {stats.tpm}
          </Badge>
        </div>
      ) : null}
    </div>
  )
}
