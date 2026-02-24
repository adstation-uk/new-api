'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  CreditCard,
  Key,
  Loader2,
  Shield,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useRouter } from '@/i18n/navigation'
import { cn, renderQuota } from '@/lib/utils'
import { createToken, getGroups, getModels, updateToken } from './actions'

const tokenSchema = z.object({
  name: z.string().min(1, '请输入名称'),
  remain_quota: z.string().refine((val) => {
    const n = Number(val)
    return !Number.isNaN(n) && n >= 0
  }, '额度必须是大于等于 0 的数字'),
  unlimited_quota: z.boolean(),
  expired_time: z.date().optional(),
  model_limits_enabled: z.boolean(),
  model_limits: z.array(z.string()).optional().default([]),
  allow_ips: z.string().optional(),
  group: z.string().optional(),
  cross_group_retry: z.boolean(),
  tokenCount: z.number().min(1).max(100),
})

type TokenFormValues = z.infer<typeof tokenSchema>

type TokenDrawerProps = {
  isOpen: boolean
  onClose: () => void
  editingToken?: any
}

export function TokenDrawer({
  isOpen,
  onClose,
  editingToken,
}: TokenDrawerProps) {
  const isEdit = !!editingToken
  const router = useRouter()
  const [models, setModels] = useState<string[]>([])
  const [groups, setGroups] = useState<{ label: string, value: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<TokenFormValues>({
    resolver: zodResolver(tokenSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      remain_quota: '500000',
      unlimited_quota: true,
      expired_time: undefined,
      model_limits_enabled: false,
      model_limits: [],
      allow_ips: '',
      group: '',
      cross_group_retry: false,
      tokenCount: 1,
    },
  })

  const fetchModels = async () => {
    try {
      const data = await getModels()
      if (data.success) {
        setModels(data.data || [])
      }
    }
    catch (e) {
      console.error('Failed to fetch models', e)
    }
  }

  const fetchGroups = async () => {
    try {
      const data = await getGroups()
      if (data.success) {
        const groupOptions = Object.entries(data.data).map(
          ([key, info]: [string, any]) => ({
            label: info.desc || key,
            value: key,
            ratio: info.ratio,
          }),
        )
        setGroups(groupOptions)
      }
    }
    catch (e) {
      console.error('Failed to fetch groups', e)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchModels()
      fetchGroups()
      if (editingToken) {
        form.reset({
          name: editingToken.name || '',
          remain_quota: (editingToken.remain_quota || 0).toString(),
          unlimited_quota: !!editingToken.unlimited_quota,
          expired_time:
            editingToken.expired_time !== -1 && editingToken.expired_time
              ? new Date(editingToken.expired_time * 1000)
              : undefined,
          model_limits_enabled: !!editingToken.model_limits_enabled,
          model_limits: editingToken.model_limits
            ? editingToken.model_limits.split(',')
            : [],
          allow_ips: editingToken.allow_ips || '',
          group: editingToken.group || '',
          cross_group_retry: !!editingToken.cross_group_retry,
          tokenCount: 1,
        })
      }
      else {
        form.reset({
          name: '',
          remain_quota: '500000',
          unlimited_quota: true,
          expired_time: undefined,
          model_limits_enabled: false,
          model_limits: [],
          allow_ips: '',
          group: '',
          cross_group_retry: false,
          tokenCount: 1,
        })
      }
    }
  }, [isOpen, editingToken, form])

  async function onSubmit(values: TokenFormValues) {
    setIsLoading(true)
    try {
      const basePayload = {
        name: values.name,
        unlimited_quota: values.unlimited_quota,
        remain_quota: Number.parseInt(values.remain_quota),
        expired_time: values.expired_time
          ? Math.floor(values.expired_time.getTime() / 1000)
          : -1,
        model_limits_enabled: values.model_limits.length > 0,
        model_limits: values.model_limits.join(','),
        allow_ips: values.allow_ips || '',
        group: values.group || '',
        cross_group_retry: values.cross_group_retry,
      }

      if (isEdit) {
        const res = await updateToken({
          ...basePayload,
          id: editingToken.id,
        })
        if (res.success) {
          toast.success('更新成功')
          onClose()
          router.refresh()
        }
        else {
          toast.error(res.message || '更新失败')
        }
      }
      else {
        // Handle multiple creation
        let successCount = 0
        const count = values.tokenCount
        for (let i = 0; i < count; i++) {
          const payload = { ...basePayload }

          if (count > 1) {
            const suffix = Math.random().toString(36).substring(2, 8)
            payload.name = `${values.name}-${suffix}`
          }

          const res = await createToken(payload)
          if (res.success)
            successCount++
        }

        if (successCount === count) {
          toast.success(`成功创建 ${count} 个令牌`)
          onClose()
          router.refresh()
        }
        else {
          toast.error(`创建完成，成功 ${successCount}/${count}`)
          onClose()
          router.refresh()
        }
      }
    }
    catch {
      toast.error('操作失败')
    }
    finally {
      setIsLoading(false)
    }
  }

  const unlimited = useWatch({
    control: form.control,
    name: 'unlimited_quota',
  })
  const selectedGroup = useWatch({ control: form.control, name: 'group' })

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col h-full scrollbar-none text-sm">
        <SheetHeader className="p-4 border-b flex-row items-center gap-2 space-y-0">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5">
            <SheetTitle className="text-lg font-bold leading-none">
              {isEdit ? '编辑令牌' : '创建令牌'}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground leading-none">
              {isEdit ? '修改令牌配置' : '配置并发布新的 API 令牌'}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-none">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* 基本信息 */}
              <Card className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <h4 className="font-semibold">基本信息</h4>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>名称</FormLabel>
                      <FormControl>
                        <Input placeholder="令牌名称" {...field} />
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
                      <FormLabel>令牌分组</FormLabel>
                      <Select
                        onValueChange={val => field.onChange(val === 'default' ? '' : val)}
                        value={field.value || 'default'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="默认分组" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent shadow-none="true">
                          <SelectItem key="default_option" value="default">
                            <div className="flex items-center justify-between w-full gap-2">
                              <span>默认分组</span>
                            </div>
                          </SelectItem>
                          {groups.filter(g => g.value !== 'default').map(g => (
                            <SelectItem key={g.value} value={g.value}>
                              <div className="flex items-center justify-between w-full gap-4">
                                <span>{g.label}</span>
                                <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                                  {(g as any).ratio}
                                  x
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        留空则跟随用户默认分组
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedGroup === 'auto' && (
                  <FormField
                    control={form.control}
                    name="cross_group_retry"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>跨分组重试</FormLabel>
                          <FormDescription>
                            开启后失败会自动尝试其他可用分组
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="expired_time"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>过期时间</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value
                                ? (
                                    format(field.value, 'PPP HH:mm:ss', { locale: zhCN })
                                  )
                                : (
                                    <span>永不过期</span>
                                  )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            className="rounded-md"
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={date =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                            locale={zhCN}
                          />
                          <Separator />
                          <div className="p-3">
                            <Label className="text-[10px] text-muted-foreground uppercase mb-1 block text-center">选择精确时间</Label>
                            <Input
                              type="time"
                              step="1"
                              value={field.value ? format(field.value, 'HH:mm:ss') : '00:00:00'}
                              onChange={(e) => {
                                const [h, m, s] = e.target.value.split(':').map(Number)
                                const d = field.value ? new Date(field.value) : new Date()
                                d.setHours(h || 0, m || 0, s || 0)
                                field.onChange(d)
                              }}
                              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none text-center"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => field.onChange(undefined)}
                        >
                          永不过期
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            const d = new Date()
                            d.setMonth(d.getMonth() + 1)
                            field.onChange(d)
                          }}
                        >
                          一个月
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            const d = new Date()
                            d.setDate(d.getDate() + 1)
                            field.onChange(d)
                          }}
                        >
                          一天
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            const d = new Date()
                            d.setHours(d.getHours() + 1)
                            field.onChange(d)
                          }}
                        >
                          一小时
                        </Button>
                      </div>
                      <FormDescription>留空为永不过期</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isEdit && (
                  <FormField
                    control={form.control}
                    name="tokenCount"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>新建数量</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(
                                Number.parseInt(e.target.value),
                              )}
                          />
                        </FormControl>
                        <FormDescription>
                          批量创建时会在名称后添加随机后缀
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </Card>

              {/* 额度设置 */}
              <Card className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold">额度设置</h4>
                </div>

                <FormField
                  control={form.control}
                  name="unlimited_quota"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>不限额度</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {!unlimited && (
                  <FormField
                    control={form.control}
                    name="remain_quota"
                    render={({ field }) => (
                      <FormItem className="flex flex-col animate-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between">
                          <FormLabel>可用额度</FormLabel>
                          <span className="text-xs text-muted-foreground">
                            等价金额:
                            {' '}
                            {renderQuota(Number.parseInt(field.value || '0'))}
                          </span>
                        </div>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[
                            { label: '1$', value: 500000 },
                            { label: '10$', value: 5000000 },
                            { label: '50$', value: 25000000 },
                            { label: '100$', value: 50000000 },
                            { label: '500$', value: 250000000 },
                            { label: '1000$', value: 500000000 },
                          ].map(opt => (
                            <Button
                              key={opt.label}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[10px]"
                              onClick={() => field.onChange(opt.value.toString())}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </Card>

              {/* 访问限制 */}
              <Card className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold">访问限制</h4>
                </div>

                <FormField
                  control={form.control}
                  name="model_limits"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>模型限制</FormLabel>
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'w-full justify-between h-auto min-h-10 px-3',
                                !field.value?.length && 'text-muted-foreground',
                              )}
                            >
                              <div className="flex flex-wrap gap-1 py-1">
                                {field.value && field.value.length > 0
                                  ? (
                                      field.value.map(model => (
                                        <Badge
                                          key={model}
                                          variant="secondary"
                                          className="font-normal"
                                        >
                                          {model}
                                        </Badge>
                                      ))
                                    )
                                  : (
                                      '选择模型...'
                                    )}
                              </div>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="搜索模型..." />
                            <CommandList>
                              <CommandEmpty>未找到模型</CommandEmpty>
                              <CommandGroup>
                                {models.map(model => (
                                  <CommandItem
                                    key={model}
                                    value={model}
                                    onSelect={() => {
                                      const current = field.value || []
                                      const next = current.includes(model)
                                        ? current.filter(m => m !== model)
                                        : [...current, model]
                                      field.onChange(next)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value?.includes(model)
                                          ? 'opacity-100'
                                          : 'opacity-0',
                                      )}
                                    />
                                    {model}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        留空支持所有模型。不建议启用模型限制。
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allow_ips"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>IP 白名单</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例如: 127.0.0.1, 每行一个"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>留空则不限制 IP</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEdit ? '保存更改' : '立即创建'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
