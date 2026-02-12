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
import { Progress } from '@/components/ui/progress'
import { 
  MoreHorizontal, 
  UserCog, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  Key, 
  Smartphone,
  Pencil
} from 'lucide-react'
import { renderQuota, renderNumber } from '@/lib/utils'
import { manageUser, resetUserPasskey, resetUserTwoFA } from './actions'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface User {
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
  onEdit 
}: { 
  data: User[], 
  onEdit: (user: User) => void 
}) {
  const handleManage = async (id: number, action: any, label: string) => {
    const loadingToast = toast.loading(`正在执行${label}...`)
    try {
      const result = await manageUser(id, action)
      if (result.success) {
        toast.success(`${label}成功`)
      } else {
        toast.error(result.message || `${label}失败`)
      }
    } catch (e) {
      toast.error('网络请求失败')
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  const handleResetSecurity = async (id: number, type: 'passkey' | '2fa', label: string) => {
    const loadingToast = toast.loading(`正在重置${label}...`)
    try {
        const result = type === 'passkey' ? await resetUserPasskey(id) : await resetUserTwoFA(id)
        if (result.success) {
            toast.success(`${label}重置成功`)
        } else {
            toast.error(result.message || `${label}重置失败`)
        }
    } catch (e) {
        toast.error('网络请求失败')
    } finally {
        toast.dismiss(loadingToast)
    }
  }

  const renderRole = (role: number) => {
    switch (role) {
      case 1: return <Badge variant="secondary">普通用户</Badge>
      case 10: return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">管理员</Badge>
      case 100: return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200">超级管理员</Badge>
      default: return <Badge variant="outline">未知</Badge>
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>用户名 / 显示名</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>角色</TableHead>
            <TableHead className="w-[200px]">额度使用 (剩余 / 总额)</TableHead>
            <TableHead>统计</TableHead>
            <TableHead className="text-right">操作</TableHead>
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
                                备注: {user.remark}
                            </Badge>
                        </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {isDeleted ? (
                    <Badge variant="destructive">已注销</Badge>
                  ) : user.status === 1 ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">已启用</Badge>
                  ) : (
                    <Badge variant="destructive">已禁用</Badge>
                  )}
                </TableCell>
                <TableCell>{renderRole(user.role)}</TableCell>
                <TableCell>
                   <div className="flex flex-col gap-1.5 min-w-[150px]">
                      <div className="flex justify-between text-[10px] text-muted-foreground leading-none">
                        <span>{renderQuota(user.quota)} / {renderQuota(total)}</span>
                        <span>{percent.toFixed(0)}%</span>
                      </div>
                      <Progress value={percent} className="h-1.5" />
                   </div>
                </TableCell>
                <TableCell>
                   <TooltipProvider>
                    <div className="flex flex-wrap gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-[10px] cursor-default">请求: {renderNumber(user.request_count)}</Badge>
                            </TooltipTrigger>
                            <TooltipContent>总调用次数</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-[10px] cursor-default">邀请: {user.aff_count}</Badge>
                            </TooltipTrigger>
                            <TooltipContent>邀请人数 / 历史邀请额度: {renderQuota(user.aff_history_quota)}</TooltipContent>
                        </Tooltip>
                    </div>
                   </TooltipProvider>
                </TableCell>
                <TableCell className="text-right text-right-important">
                  <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(user)} title="编辑">
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
                            <DropdownMenuLabel>管理操作</DropdownMenuLabel>
                            {user.status === 1 ? (
                                <DropdownMenuItem onClick={() => handleManage(user.id, 'disable', '禁用')} className="text-red-600">
                                <Ban className="mr-2 h-4 w-4" /> 禁用用户
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => handleManage(user.id, 'enable', '启用')} className="text-green-600">
                                <CheckCircle2 className="mr-2 h-4 w-4" /> 启用用户
                                </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleManage(user.id, 'promote', '提权')}>
                                <ShieldCheck className="mr-2 h-4 w-4" /> 设为管理员
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManage(user.id, 'demote', '降权')}>
                                <ShieldAlert className="mr-2 h-4 w-4" /> 设为普通用户
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleResetSecurity(user.id, 'passkey', 'Passkey')}>
                                <Key className="mr-2 h-4 w-4" /> 重置 Passkey
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetSecurity(user.id, '2fa', '2FA')}>
                                <Smartphone className="mr-2 h-4 w-4" /> 重置 2FA
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleManage(user.id, 'delete', '注销')} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> 注销用户
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
                没有找到匹配的用户
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
