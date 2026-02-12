'use client'

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Info,
  CircleCheck,
  CircleDashed,
  Layers,
  Globe
} from 'lucide-react'
import { ModelIcon } from '@/components/model-icon'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { manageModel } from './actions'
import { toast } from 'sonner'

interface ModelMeta {
  id: number
  model_name: string
  description: string
  icon: string
  tags: string
  vendor_id: number
  status: number
  sync_official: number
  bound_channels: any[]
  enable_groups: string[]
  matched_models: string[]
  matched_count: number
  name_rule: number
}

interface Vendor {
  id: number
  name: string
  icon: string
}

export function ModelsTable({ 
  data, 
  vendors,
  onEdit 
}: { 
  data: ModelMeta[], 
  vendors: Vendor[],
  onEdit: (model: ModelMeta) => void 
}) {
  const vendorMap = React.useMemo(() => {
    const map: Record<number, Vendor> = {}
    vendors.forEach(v => { map[v.id] = v })
    return map
  }, [vendors])

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个模型吗？此操作无法撤销。')) return
    
    const loadingToast = toast.loading('正在删除...')
    try {
      const result = await manageModel(id, 'delete')
      if (result.success) {
        toast.success('删除成功')
      } else {
        toast.error(result.message || '删除失败')
      }
    } catch (e) {
      toast.error('网络请求失败')
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">图标</TableHead>
            <TableHead>模型名称 / 别名</TableHead>
            <TableHead>供应商</TableHead>
            <TableHead>适用范围 / 分组</TableHead>
            <TableHead>状态</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((model) => {
            const vendor = vendorMap[model.vendor_id]
            const tags = model.tags ? model.tags.split(',').filter(Boolean) : []
            const nameRuleLabels = ['精确', '前缀', '包含', '后缀']
            
            return (
              <TableRow key={model.id}>
                <TableCell>
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg border bg-muted/30">
                     <ModelIcon 
                        symbol={model.icon || vendor?.icon || 'Layers'} 
                        size={20} 
                     />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm">{model.model_name}</span>
                        <Badge variant="outline" className="text-[10px] py-0 h-4 px-1 font-normal bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-900">
                            {nameRuleLabels[model.name_rule] || '精确'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                        {tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px] py-0 h-4 px-1 font-normal">
                                {tag}
                            </Badge>
                        ))}
                        {model.matched_count > 0 && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="secondary" className="text-[10px] py-0 h-4 px-1 font-normal cursor-help">
                                            匹配 {model.matched_count} 款
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[300px]">
                                        <div className="flex flex-wrap gap-1">
                                            {model.matched_models?.map(m => (
                                                <code key={m} className="bg-muted px-1 rounded text-xs">{m}</code>
                                            ))}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-background font-normal flex items-center gap-1.5 py-1 px-2 border-dashed">
                        <ModelIcon symbol={vendor?.icon || 'Layers'} size={14} />
                        {vendor?.name || '未知供应商'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {model.enable_groups?.length > 0 ? (
                        model.enable_groups.map(g => (
                            <Badge key={g} className="text-[10px] py-0 h-4 px-1.5 font-normal bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900">
                                {g}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-xs text-muted-foreground italic">全部可用</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                        {model.status === 1 ? (
                            <Badge className="bg-green-50 text-green-700 border-green-100 font-normal hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:border-green-900">
                                <CircleCheck className="w-3 h-3 mr-1" /> 已启用
                            </Badge>
                        ) : (
                             <Badge variant="destructive" className="font-normal opacity-80">
                                <CircleDashed className="w-3 h-3 mr-1" /> 已下架
                            </Badge>
                        )}
                        {model.sync_official === 1 && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Globe className="w-3.5 h-3.5 text-sky-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>同步官方</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                   </div>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(model)}>
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>模型管理</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onEdit(model)}>
                                    <Info className="w-4 h-4 mr-2" /> 查看详情
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDelete(model.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> 删除模型
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {data.length === 0 && (
         <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-2">
            <Layers className="w-10 h-10 opacity-20" />
            <p>未找到匹配的模型记录</p>
         </div>
      )}
    </div>
  )
}
