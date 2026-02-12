'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { createUser, updateUser } from './actions'

const userSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(1, '用户名不能为空'),
  display_name: z.string().optional(),
  password: z.string().optional(),
  quota: z.coerce.number().min(0, '额度不能为负'),
  group: z.string().default('default'),
  remark: z.string().optional(),
})

type UserFormValues = z.infer<typeof userSchema>

type User = {
  id: number
  username: string
  display_name: string
  quota: number
  group?: string
  remark?: string
}

export function UserSheet({
  user,
  open,
  onOpenChange,
}: {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      display_name: '',
      password: '',
      quota: 0,
      group: 'default',
      remark: '',
    },
  })

  React.useEffect(() => {
    if (user) {
      form.reset({
        id: user.id,
        username: user.username,
        display_name: user.display_name || '',
        password: '', // Password stays empty unless changing
        quota: user.quota / 500000,
        group: user.group || 'default',
        remark: user.remark || '',
      })
    }
    else {
      form.reset({
        username: '',
        display_name: '',
        password: '',
        quota: 0,
        group: 'default',
        remark: '',
      })
    }
  }, [user, form])

  async function onSubmit(values: UserFormValues) {
    const loadingToast = toast.loading(user ? '正在更新用户信息...' : '正在创建用户...')
    try {
      const payload = {
        ...values,
        quota: Math.round(values.quota * 500000),
      }
      if (user)
        payload.id = user.id
      if (!payload.password && user)
        delete payload.password

      const result = user ? await updateUser(payload) : await createUser(payload)
      if (result.success) {
        toast.success(user ? '更新成功' : '创建成功')
        onOpenChange(false)
      }
      else {
        toast.error(result.message || (user ? '更新失败' : '创建失败'))
      }
    }
    catch {
      toast.error('网络请求失败')
    }
    finally {
      toast.dismiss(loadingToast)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{user ? '编辑用户' : '添加用户'}</SheetTitle>
          <SheetDescription>
            修改用户的基本信息、额度和权限组。
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="输入用户名" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>显示名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="输入用于显示的名称" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>重置密码</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="留空则不修改密码" />
                  </FormControl>
                  <FormDescription>如果不打算修改密码，请保持此项为空</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>剩余额度 (单位: $)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.0001"
                      onChange={e => field.onChange(Number.parseFloat(e.target.value) || 0)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户分组</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择用户分组" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="default">默认分组 (default)</SelectItem>
                      <SelectItem value="vip">高级用户 (vip)</SelectItem>
                      <SelectItem value="svip">超级用户 (svip)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>这会影响渠道的优先级和倍率计算</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="输入备注信息" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <Button type="submit">保存更改</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
