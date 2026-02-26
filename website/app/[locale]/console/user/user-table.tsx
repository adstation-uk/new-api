'use client'

import {
  Ban,
  CheckCircle2,
  Key,
  MoreHorizontal,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import { toast } from 'sonner'
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
import { Progress } from '@/components/ui/progress'
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
import { renderNumber, renderQuota } from '@/lib/utils'
import { manageUser, resetUserPasskey, resetUserTwoFA } from './actions'

type User = {
  id: number
  username: string
  display_name: string
  role: number
  status: number
  quota: number
  used_quota: number
  request_count: number
  aff_count: number
  aff_history_quota: number
  inviter_id: number
  remark: string
  DeletedAt: any
}

export function UserTable({
  data,
  onEdit,
}: {
  data: User[]
  onEdit: (user: User) => void
}) {
  const t = useTranslations('Page.Console.User.table')
  const commonT = useTranslations('Common')
  const handleManage = async (id: number, action: any, label: string) => {
    const loadingToast = toast.loading(t('toast.executing', { label }))
    try {
      const result = await manageUser(id, action)
      if (result.success) {
        toast.success(t('toast.actionSuccess', { label }))
      }
      else {
        toast.error(result.message || t('toast.actionFailed', { label }))
      }
    }
    catch {
      toast.error(commonT('errors.network'))
    }
    finally {
      toast.dismiss(loadingToast)
    }
  }

  const handleResetSecurity = async (id: number, type: 'passkey' | '2fa', label: string) => {
    const loadingToast = toast.loading(t('toast.resetting', { label }))
    try {
      const result = type === 'passkey' ? await resetUserPasskey(id) : await resetUserTwoFA(id)
      if (result.success) {
        toast.success(t('toast.resetSuccess', { label }))
      }
      else {
        toast.error(result.message || t('toast.resetFailed', { label }))
      }
    }
    catch {
      toast.error(commonT('errors.network'))
    }
    finally {
      toast.dismiss(loadingToast)
    }
  }

  const renderRole = (role: number) => {
    switch (role) {
      case 1: return <Badge variant="secondary">{commonT('status.normalUser')}</Badge>
      case 10: return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">{commonT('status.admin')}</Badge>
      case 100: return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200">{t('role.superAdmin')}</Badge>
      default: return <Badge variant="outline">{commonT('status.unknown')}</Badge>
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>{t('columns.user')}</TableHead>
            <TableHead>{t('columns.status')}</TableHead>
            <TableHead>{t('columns.role')}</TableHead>
            <TableHead className="w-[200px]">{t('columns.quota')}</TableHead>
            <TableHead>{t('columns.stats')}</TableHead>
            <TableHead className="text-right">{t('columns.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user) => {
            const used = user.used_quota || 0
            const total = (user.quota || 0) + used
            const percent = total > 0 ? ((user.quota || 0) / total) * 100 : 0
            const isDeleted = user.DeletedAt !== null

            return (
              <TableRow key={user.id} className={isDeleted ? 'opacity-50 grayscale' : ''}>
                <TableCell className="font-mono text-xs">{user.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.username}</span>
                    <span className="text-xs text-muted-foreground">{user.display_name || '-'}</span>
                    {user.remark && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-[10px] font-normal leading-tight h-auto py-0.5 max-w-[150px] truncate block" title={user.remark}>
                          {t('remarkPrefix')}
                          {user.remark}
                        </Badge>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {isDeleted
                    ? (
                        <Badge variant="destructive">{t('status.deleted')}</Badge>
                      )
                    : user.status === 1
                      ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">{commonT('status.enabled')}</Badge>
                        )
                      : (
                          <Badge variant="destructive">{commonT('status.disabled')}</Badge>
                        )}
                </TableCell>
                <TableCell>{renderRole(user.role)}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5 min-w-[150px]">
                    <div className="flex justify-between text-[10px] text-muted-foreground leading-none">
                      <span>
                        {renderQuota(user.quota)}
                        {' '}
                        /
                        {' '}
                        {renderQuota(total)}
                      </span>
                      <span>
                        {percent.toFixed(0)}
                        %
                      </span>
                    </div>
                    <Progress value={percent} className="h-1.5" />
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <div className="flex flex-wrap gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-[10px] cursor-default">
                            {t('stats.request')}
                            {renderNumber(user.request_count)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{t('stats.requestTooltip')}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-[10px] cursor-default">
                            {t('stats.invite')}
                            {user.aff_count}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t('stats.inviteTooltip')}
                          {renderQuota(user.aff_history_quota)}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-right text-right-important">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(user)} title={t('edit')}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!isDeleted && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('menu.title')}</DropdownMenuLabel>
                          {user.status === 1
                            ? (
                                <DropdownMenuItem onClick={() => handleManage(user.id, 'disable', t('action.disable'))} className="text-red-600">
                                  <Ban className="mr-2 h-4 w-4" />
                                  {t('menu.disableUser')}
                                </DropdownMenuItem>
                              )
                            : (
                                <DropdownMenuItem onClick={() => handleManage(user.id, 'enable', t('action.enable'))} className="text-green-600">
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  {t('menu.enableUser')}
                                </DropdownMenuItem>
                              )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleManage(user.id, 'promote', t('action.promote'))}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            {t('menu.makeAdmin')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleManage(user.id, 'demote', t('action.demote'))}>
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            {t('menu.makeNormal')}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleResetSecurity(user.id, 'passkey', 'Passkey')}>
                            <Key className="mr-2 h-4 w-4" />
                            {t('menu.resetPasskey')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetSecurity(user.id, '2fa', '2FA')}>
                            <Smartphone className="mr-2 h-4 w-4" />
                            {t('menu.reset2fa')}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleManage(user.id, 'delete', t('action.delete'))} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('menu.deleteUser')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground italic">
                {t('empty')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
