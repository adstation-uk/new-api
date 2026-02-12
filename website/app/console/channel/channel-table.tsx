'use client'

import type {
  ColumnDef,
  SortingState,
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  DollarSign,
  Edit,
  LayoutGrid,
  MoreHorizontal,
  RefreshCw,
  TestTube2,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getChannelOption } from '@/lib/channel'
import { toggleChannelStatus, deleteChannel, testChannel, updateChannelBalance, saveChannel } from './actions'

type Channel = {
  id: number
  type: number
  key: string
  status: number
  name: string
  weight: number
  test_time: number
  response_time: number
  balance: number
  balance_updated_time: number
  models: string
  group: string
  used_quota: number
  tag?: string
  priority?: number
  auto_ban?: number
  other?: string
  other_info?: string
  base_url?: string
  model_mapping?: string
  channel_info?: {
    is_multi_key: boolean
    multi_key_size: number
  }
}

export function ChannelTable({
  data = [],
  selectedIds,
  onSelectedIdsChange,
  onEdit,
  onTest,
}: {
  data: Channel[]
  selectedIds: number[]
  onSelectedIdsChange: (ids: number[]) => void
  onEdit: (channel: Channel) => void
  onTest?: (channel: Channel) => void
}) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])

  const [editingId, setEditingId] = useState<string | null>(null)

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 2 : 1
    const loadingToast = toast.loading('正在更新状态...')
    try {
      const result = await toggleChannelStatus(id, newStatus)
      if (result.success) {
        toast.success(result.message || '状态更新成功')
      } else {
        toast.error(result.message || '状态更新失败')
      }
    } catch (error) {
      toast.error('网络连接错误')
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该渠道吗？')) return
    const loadingToast = toast.loading('正在删除...')
    try {
      const result = await deleteChannel(id)
      if (result.success) {
        toast.success('删除成功')
      } else {
        toast.error(result.message || '删除失败')
      }
    } catch (error) {
      toast.error('网络连接错误')
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  const handleTest = async (id: number) => {
    const loadingToast = toast.loading('正在测试...')
    try {
      const result = await testChannel(id)
      if (result.success) {
        toast.success(`测试成功：${result.message}`)
      } else {
        toast.error(`测试失败：${result.message}`)
      }
    } catch (error) {
      toast.error('测试出错')
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  const handleUpdateBalance = async (id: number) => {
    const loadingToast = toast.loading('正在更新余额...')
    try {
      const result = await updateChannelBalance(id)
      if (result.success) {
        toast.success(`余额更新成功：${result.message}`)
      } else {
        toast.error(`余额更新失败：${result.message}`)
      }
    } catch (error) {
      toast.error('更新出错')
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  const handleUpdateField = async (channel: Channel, field: string, value: any) => {
    const loadingToast = toast.loading('正在保存...')
    try {
      const result = await saveChannel({
        ...channel,
        [field]: value,
      })
      if (result.success) {
        toast.success('保存成功')
        setEditingId(null)
      } else {
        toast.error(result.message || '保存失败')
      }
    } catch (error) {
      toast.error('网络连接错误')
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  }

  const columns: ColumnDef<Channel>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
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
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('id')}</span>,
    },
    {
      accessorKey: 'name',
      header: '名称',
      cell: ({ row }) => (
        <div className="flex flex-col max-w-[200px]">
          <span className="font-medium truncate">{row.getValue('name')}</span>
          <div className="flex gap-1 mt-1">
            {row.original.tag && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-orange-200 text-orange-600 bg-orange-50">
                {row.original.tag}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-gray-50 text-gray-500">
              {row.original.group}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: '类型',
      cell: ({ row }) => {
        const option = getChannelOption(row.original.type)
        return (
          <Badge className={`whitespace-nowrap ${option.color} border shadow-none font-normal shrink-0`}>
            {option.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'models',
      header: '模型',
      cell: ({ row }) => {
        const models = (row.getValue('models') as string || '').split(',')
        return (
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex flex-wrap gap-1 max-w-[200px] cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors group">
                <LayoutGrid className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {models.length}
                  {' '}
                  个模型:
                  {models.slice(0, 2).join(', ')}
                  ...
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-2">
              <div className="flex flex-wrap gap-1 max-h-[300px] overflow-y-auto p-1">
                {models.map(m => (
                  <Badge key={m} variant="secondary" className="text-[10px] font-normal px-1.5 py-0 h-5">
                    {m}
                  </Badge>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )
      },
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.original.status
        const info = row.original.channel_info
        const otherInfo = row.original.other_info ? JSON.parse(row.original.other_info) : {}

        let statusBadge = null
        if (status === 1) {
          statusBadge = (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {' '}
              已启用
            </Badge>
          )
        }
        else if (status === 2) {
          statusBadge = (
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 shadow-none">
              <XCircle className="w-3 h-3 mr-1" />
              {' '}
              已禁用
            </Badge>
          )
        }
        else if (status === 3) {
          statusBadge = (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200 shadow-none cursor-help">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {' '}
                    自动禁用
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    原因:
                    {otherInfo.status_reason || '未知'}
                  </p>
                  {otherInfo.status_time && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      时间:
                      {new Date(otherInfo.status_time * 1000).toLocaleString()}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        }

        return (
          <div className="flex items-center gap-3">
            <Switch
              checked={status === 1}
              onCheckedChange={() => handleToggleStatus(row.original.id, status)}
            />
            <div className="flex flex-col items-start min-w-[80px]">
              {statusBadge}
              {info?.is_multi_key && (
                <span className="text-[10px] text-muted-foreground mt-0.5 ml-1">
                  多Key:
                  {info.multi_key_size}
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'response_time',
      header: '响应',
      cell: ({ row }) => {
        const time = row.original.response_time
        if (time === 0)
          return <span className="text-muted-foreground text-xs">未测试</span>
        const color = time < 1000 ? 'text-green-600' : time < 3000 ? 'text-yellow-600' : 'text-red-600'
        return (
          <div className="flex items-center gap-1 font-mono text-xs">
            <Zap className={`w-3 h-3 ${color}`} />
            <span className={color}>
              {(time / 1000).toFixed(2)}
              s
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'balance',
      header: '余额',
      cell: ({ row }) => (
        <div
          className="flex flex-col text-xs font-mono cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors group"
          onClick={(e) => {
            e.stopPropagation()
            handleUpdateBalance(row.original.id)
          }}
        >
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="group-hover:text-primary transition-colors">{row.original.balance.toFixed(2)}</span>
            <RefreshCw className="w-2.5 h-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {row.original.balance_updated_time > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {new Date(row.original.balance_updated_time * 1000).toLocaleDateString()}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: '优先级',
      cell: ({ row }) => {
        const id = `priority-${row.original.id}`
        const isEditing = editingId === id
        return (
          <div
            className="text-xs font-mono min-w-[40px] px-2 py-1 hover:bg-slate-100 rounded cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setEditingId(id)
            }}
          >
            {isEditing
              ? (
                  <Input
                    autoFocus
                    defaultValue={row.original.priority}
                    className="h-6 w-16 text-xs px-1"
                    onBlur={e => handleUpdateField(row.original, 'priority', Number.parseInt(e.target.value))}
                    onKeyDown={e => e.key === 'Enter' && handleUpdateField(row.original, 'priority', Number.parseInt((e.target as any).value))}
                    onClick={e => e.stopPropagation()}
                  />
                )
              : (
                  row.original.priority ?? 0
                )}
          </div>
        )
      },
    },
    {
      accessorKey: 'weight',
      header: '权重',
      cell: ({ row }) => {
        const id = `weight-${row.original.id}`
        const isEditing = editingId === id
        return (
          <div
            className="text-xs font-mono min-w-[40px] px-2 py-1 hover:bg-slate-100 rounded cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setEditingId(id)
            }}
          >
            {isEditing
              ? (
                  <Input
                    autoFocus
                    defaultValue={row.original.weight}
                    className="h-6 w-16 text-xs px-1"
                    onBlur={e => handleUpdateField(row.original, 'weight', Number.parseInt(e.target.value))}
                    onKeyDown={e => e.key === 'Enter' && handleUpdateField(row.original, 'weight', Number.parseInt((e.target as any).value))}
                    onClick={e => e.stopPropagation()}
                  />
                )
              : (
                  row.original.weight ?? 0
                )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const channel = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>管理渠道</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleTest(channel.id)}>
                <Zap className="mr-2 h-4 w-4" />
                {' '}
                快速测试
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTest?.(channel)}>
                <TestTube2 className="mr-2 h-4 w-4" />
                {' '}
                详细测试
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(channel)}>
                <Edit className="mr-2 h-4 w-4" />
                {' '}
                编辑渠道
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCopy(channel.key)}>
                <Copy className="mr-2 h-4 w-4" />
                {' '}
                复制密钥
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(channel.id)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {' '}
                删除渠道
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const rowSelection = useMemo(() => {
    const selection: Record<string, boolean> = {}
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (selectedIds.includes(item.id)) {
          selection[index] = true
        }
      })
    }
    return selection
  }, [data, selectedIds])

  const table = useReactTable({
    data: Array.isArray(data) ? data : [],
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater
      const selectedIndices = Object.keys(next).filter(k => next[k])
      const newSelectedIds = selectedIndices.map(idx => data[Number(idx)].id)
      onSelectedIdsChange(newSelectedIds)
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent bg-slate-50/50">
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} className="py-2 h-10 text-xs font-semibold text-slate-600">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="group border-b last:border-0 hover:bg-slate-50/50 transition-colors"
                onClick={() => row.toggleSelected()}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    className="py-2 px-4 whitespace-nowrap"
                    onClick={(e) => {
                      if (cell.column.id === 'actions' || cell.column.id === 'select' || cell.column.id === 'status' || cell.column.id === 'priority' || cell.column.id === 'weight') {
                        e.stopPropagation()
                      }
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                暂无渠道数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
