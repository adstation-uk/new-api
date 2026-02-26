'use client'

import {
  CircleCheck,
  CircleDashed,
  Globe,
  Info,
  Layers,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import { toast } from 'sonner'
import { ModelIcon } from '@/components/model-icon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { manageModel } from './actions'

type ModelMeta = {
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

type Vendor = {
  id: number
  name: string
  icon: string
}

export function ModelsTable({
  data,
  vendors,
  onEdit,
}: {
  data: ModelMeta[]
  vendors: Vendor[]
  onEdit: (model: ModelMeta) => void
}) {
  const t = useTranslations('Page.Console.Models.table')
  const commonT = useTranslations('Common')
  const vendorMap = React.useMemo(() => {
    const map: Record<number, Vendor> = {}
    vendors.forEach((v) => {
      map[v.id] = v
    })
    return map
  }, [vendors])

  const handleDelete = async (id: number) => {
    // eslint-disable-next-line no-alert
    if (!confirm(t('confirmDelete')))
      return

    const loadingToast = toast.loading(t('toast.deleting'))
    try {
      const result = await manageModel(id, 'delete')
      if (result.success) {
        toast.success(t('toast.deleteSuccess'))
      }
      else {
        toast.error(result.message || t('toast.deleteFailed'))
      }
    }
    catch {
      toast.error(commonT('errors.network'))
    }
    finally {
      toast.dismiss(loadingToast)
    }
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">{t('columns.icon')}</TableHead>
            <TableHead>{t('columns.model')}</TableHead>
            <TableHead>{t('columns.vendor')}</TableHead>
            <TableHead>{t('columns.scope')}</TableHead>
            <TableHead>{t('columns.status')}</TableHead>
            <TableHead className="text-right">{t('columns.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((model) => {
            const vendor = vendorMap[model.vendor_id]
            const tags = model.tags ? model.tags.split(',').filter(Boolean) : []
            const nameRuleLabels = [t('nameRule.exact'), t('nameRule.prefix'), t('nameRule.contains'), t('nameRule.suffix')]

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
                        {nameRuleLabels[model.name_rule] || t('nameRule.exact')}
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
                                {t('matchedCount', { count: model.matched_count })}
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
                      {vendor?.name || t('unknownVendor')}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {model.enable_groups?.length > 0
                      ? (
                          model.enable_groups.map(g => (
                            <Badge key={g} className="text-[10px] py-0 h-4 px-1.5 font-normal bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900">
                              {g}
                            </Badge>
                          ))
                        )
                      : (
                          <span className="text-xs text-muted-foreground italic">{t('allGroups')}</span>
                        )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {model.status === 1
                      ? (
                          <Badge className="bg-green-50 text-green-700 border-green-100 font-normal hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:border-green-900">
                            <CircleCheck className="w-3 h-3 mr-1" />
                            {' '}
                            {commonT('status.enabled')}
                          </Badge>
                        )
                      : (
                          <Badge variant="destructive" className="font-normal opacity-80">
                            <CircleDashed className="w-3 h-3 mr-1" />
                            {' '}
                            {t('archived')}
                          </Badge>
                        )}
                    {model.sync_official === 1 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Globe className="w-3.5 h-3.5 text-sky-500" />
                          </TooltipTrigger>
                          <TooltipContent>{t('syncOfficial')}</TooltipContent>
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
                        <DropdownMenuLabel>{t('menu.title')}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(model)}>
                          <Info className="w-4 h-4 mr-2" />
                          {t('menu.view')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(model.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('menu.delete')}
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
          <p>{t('empty')}</p>
        </div>
      )}
    </div>
  )
}
