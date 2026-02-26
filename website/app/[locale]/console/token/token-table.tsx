'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/data-table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  cn,
  getStatusBadgeClass,
  renderQuota,
  renderStatus,
} from '@/lib/utils'
import { TokenActions, TokenKey } from './token-row-actions'

type Token = {
  id: number
  name: string
  key: string
  status: number
  used_quota: number
  remain_quota: number
  expired_time: number
  unlimited_quota: boolean
  created_time: number
  group: string
  model_limits_enabled: boolean
  model_limits: string
  allow_ips: string
}

export function TokenTable({
  data,
  rowSelection,
  onRowSelectionChange,
}: {
  data: Token[]
  rowSelection: any
  onRowSelectionChange: any
}) {
  const t = useTranslations('Page.Console.Token.table')
  const columns: ColumnDef<Token>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
            || (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: t('columns.name'),
      cell: ({ row }) => {
        const token = row.original
        return (
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <span className="font-medium text-sm">{token.name}</span>
            <TokenKey token={token} />
          </div>
        )
      },
    },
    {
      accessorKey: 'group',
      header: t('columns.group'),
      cell: ({ row }) => {
        const group = row.getValue('group') as string
        if (group === 'auto') {
          return (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {t('autoGroup')}
            </span>
          )
        }
        return (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {group || t('defaultGroup')}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: t('columns.status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as number
        return (
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium',
              getStatusBadgeClass(status),
            )}
          >
            {renderStatus(status, t)}
          </span>
        )
      },
    },
    {
      accessorKey: 'used_quota',
      header: t('columns.usedQuota'),
      cell: ({ row }) => (
        <div className="tabular-nums text-xs">
          {renderQuota(row.getValue('used_quota'))}
        </div>
      ),
    },
    {
      accessorKey: 'remain_quota',
      header: t('columns.remainQuota'),
      cell: ({ row }) => {
        const token = row.original
        return (
          <div className="tabular-nums text-xs font-medium">
            {token.unlimited_quota
              ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="text-lg">∞</span>
                    {' '}
                    {t('unlimited')}
                  </span>
                )
              : (
                  renderQuota(token.remain_quota)
                )}
          </div>
        )
      },
    },
    {
      id: 'limits',
      header: t('columns.limits'),
      cell: ({ row }) => {
        const token = row.original
        const hasModelLimit = token.model_limits_enabled && token.model_limits
        const hasIpLimit = token.allow_ips

        if (!hasModelLimit && !hasIpLimit) {
          return <span className="text-muted-foreground text-[10px]">{t('unlimited')}</span>
        }

        return (
          <div className="flex flex-col gap-1">
            {hasModelLimit && (
              <div className="flex items-center gap-1 group relative">
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-medium cursor-help">
                  {t('modelLimited')}
                </span>
                <div className="invisible group-hover:visible absolute bottom-full left-0 mb-1 z-50 w-48 p-2 bg-popover text-popover-foreground rounded border shadow-md text-[10px]">
                  {token.model_limits}
                </div>
              </div>
            )}
            {hasIpLimit && (
              <div className="flex items-center gap-1 group relative">
                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] font-medium cursor-help">
                  {t('ipLimited')}
                </span>
                <div className="invisible group-hover:visible absolute bottom-full left-0 mb-1 z-50 w-48 p-2 bg-popover text-popover-foreground rounded border shadow-md text-[10px]">
                  {token.allow_ips}
                </div>
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'created_time',
      header: t('columns.createdTime'),
      cell: ({ row }) => (
        <div className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">
          {new Date((row.getValue('created_time') as number) * 1000).toLocaleString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{t('columns.actions')}</div>,
      cell: ({ row }) => <TokenActions token={row.original} />,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      className="border-none"
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      getRowId={row => row.id.toString()}
    />
  )
}
