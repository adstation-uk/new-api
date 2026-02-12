'use client'

import type { ColumnDef } from '@tanstack/react-table'
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
      header: '名称',
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
      header: '分组',
      cell: ({ row }) => {
        const group = row.getValue('group') as string
        if (group === 'auto') {
          return (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              智能熔断
            </span>
          )
        }
        return (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {group || '默认'}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.getValue('status') as number
        return (
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium',
              getStatusBadgeClass(status),
            )}
          >
            {renderStatus(status)}
          </span>
        )
      },
    },
    {
      accessorKey: 'used_quota',
      header: '已用额度',
      cell: ({ row }) => (
        <div className="tabular-nums text-xs">
          {renderQuota(row.getValue('used_quota'))}
        </div>
      ),
    },
    {
      accessorKey: 'remain_quota',
      header: '剩余额度',
      cell: ({ row }) => {
        const token = row.original
        return (
          <div className="tabular-nums text-xs font-medium">
            {token.unlimited_quota
              ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="text-lg">∞</span>
                    {' '}
                    无限制
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
      header: '限制',
      cell: ({ row }) => {
        const token = row.original
        const hasModelLimit = token.model_limits_enabled && token.model_limits
        const hasIpLimit = token.allow_ips

        if (!hasModelLimit && !hasIpLimit) {
          return <span className="text-muted-foreground text-[10px]">无限制</span>
        }

        return (
          <div className="flex flex-col gap-1">
            {hasModelLimit && (
              <div className="flex items-center gap-1 group relative">
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-medium cursor-help">
                  模型受限
                </span>
                <div className="invisible group-hover:visible absolute bottom-full left-0 mb-1 z-50 w-48 p-2 bg-popover text-popover-foreground rounded border shadow-md text-[10px]">
                  {token.model_limits}
                </div>
              </div>
            )}
            {hasIpLimit && (
              <div className="flex items-center gap-1 group relative">
                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] font-medium cursor-help">
                  IP 受限
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
      header: '创建时间',
      cell: ({ row }) => (
        <div className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">
          {new Date((row.getValue('created_time') as number) * 1000).toLocaleString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">操作</div>,
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
