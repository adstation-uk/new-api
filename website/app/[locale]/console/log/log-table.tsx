'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn, getLogTypeClass, renderLogType, renderQuota } from '@/lib/utils'

type Log = {
  id: number
  created_at: number
  type: number
  username: string
  token_name: string
  model_name: string
  quota: number
  prompt_tokens: number
  completion_tokens: number
  use_time: number
  content: string
  channel: number
  ip: string
  other: string
}

export function LogTable({ data, isAdmin }: { data: Log[], isAdmin: boolean }) {
  const t = useTranslations('Common')
  const p = useTranslations('Page.Console.Log')
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)

  const columns: ColumnDef<Log>[] = [
    {
      accessorKey: 'created_at',
      header: t('table.time'),
      cell: ({ row }) => {
        const date = new Date((row.getValue('created_at') as number) * 1000)
        return (
          <div className="flex flex-col whitespace-nowrap">
            <span>{date.toLocaleDateString()}</span>
            <span className="text-xs text-muted-foreground">{date.toLocaleTimeString()}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'type',
      header: t('table.type'),
      cell: ({ row }) => {
        const type = row.getValue('type') as number
        return (
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap',
              getLogTypeClass(type),
            )}
          >
            {renderLogType(type, t)}
          </span>
        )
      },
    },
    ...(isAdmin
      ? [
          {
            accessorKey: 'channel',
            header: t('table.channel'),
            cell: ({ row }: { row: any }) => {
              const channelId = row.getValue('channel') as number
              return channelId
                ? (
                    <Badge variant="outline" className="font-mono">
                      {channelId}
                    </Badge>
                  )
                : null
            },
          },
        ]
      : []),
    {
      accessorKey: 'model_name',
      header: t('table.model'),
      cell: ({ row }) => {
        const model = row.getValue('model_name') as string
        return model
          ? (
              <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-mono border border-border whitespace-nowrap">
                {model}
              </span>
            )
          : null
      },
    },
    {
      accessorKey: 'username',
      header: isAdmin ? t('table.userToken') : t('table.token'),
      cell: ({ row }) => {
        const log = row.original
        return (
          <div className="flex flex-col min-w-[100px]">
            {isAdmin && <span className="font-medium text-foreground truncate">{log.username}</span>}
            <span className={cn('text-xs truncate', isAdmin ? 'text-muted-foreground/70' : 'font-medium text-foreground')}>
              {log.token_name || (isAdmin ? t('status.systemToken') : t('status.defaultToken'))}
            </span>
          </div>
        )
      },
    },
    {
      id: 'consumption',
      header: t('table.consumptionDetail'),
      cell: ({ row }) => {
        const log = row.original
        const isConsumption = log.type === 2
        return (
          <div className="flex flex-col gap-0.5 min-w-[120px]">
            {isConsumption && (
              <span className="text-[10px] text-muted-foreground whitespace-nowrap text-right">
                {log.prompt_tokens}
                {' '}
                +
                {log.completion_tokens}
              </span>
            )}
            <span className={cn(
              'font-bold text-right',
              log.quota > 0 ? 'text-primary' : log.quota < 0 ? 'text-red-500' : 'text-muted-foreground',
            )}
            >
              {renderQuota(log.quota)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'use_time',
      header: t('table.duration'),
      cell: ({ row }) => {
        const ms = row.getValue('use_time') as number
        if (ms === 0)
          return '-'
        return (
          <span className={cn(
            'text-xs whitespace-nowrap',
            ms > 30000 ? 'text-red-500' : ms > 10000 ? 'text-orange-500' : 'text-muted-foreground',
          )}
          >
            {(ms / 1000).toFixed(1)}
            s
          </span>
        )
      },
    },
    {
      accessorKey: 'content',
      header: t('table.detail'),
      cell: ({ row }) => (
        <div
          className="max-w-[200px] truncate text-muted-foreground text-xs"
          title={row.getValue('content')}
        >
          {row.getValue('content')}
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        className="border-none"
        onRowClick={row => setSelectedLog(row)}
      />

      <Dialog open={!!selectedLog} onOpenChange={open => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{p('detailTitle')}</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div className="space-y-1">
                <span className="text-muted-foreground">ID</span>
                <p className="font-mono">{selectedLog.id}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">{t('table.time')}</span>
                <p>{new Date(selectedLog.created_at * 1000).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">{t('table.type')}</span>
                <div>
                  <Badge variant="secondary" className={getLogTypeClass(selectedLog.type)}>
                    {renderLogType(selectedLog.type, t)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">{t('table.duration')}</span>
                <p>
                  {selectedLog.use_time}
                  ms
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">{t('table.user')}</span>
                <p>{selectedLog.username}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">{t('table.token')}</span>
                <p>{selectedLog.token_name || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">{t('table.model')}</span>
                <p className="font-mono">{selectedLog.model_name || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">{t('table.consumption')}</span>
                <p className="font-bold">{renderQuota(selectedLog.quota)}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-muted-foreground">{t('table.detailContent')}</span>
                <p className="bg-muted p-2 rounded break-all">{selectedLog.content}</p>
              </div>
              {selectedLog.ip && (
                <div className="space-y-1">
                  <span className="text-muted-foreground">IP</span>
                  <p className="font-mono text-xs">{selectedLog.ip}</p>
                </div>
              )}
              {selectedLog.other && (
                <div className="col-span-2 space-y-1">
                  <span className="text-muted-foreground">{t('table.other')}</span>
                  <pre className="bg-muted p-2 rounded text-[10px] overflow-auto max-h-[200px]">
                    {JSON.stringify(JSON.parse(selectedLog.other), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
