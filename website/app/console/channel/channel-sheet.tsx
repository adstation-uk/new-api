'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Copy, Trash2, X, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
import { CHANNEL_OPTIONS } from '@/lib/channel'
import { fetchChannelModels, fetchChannelModelsById, saveChannel } from './actions'
import { ModelSelectDialog } from './model-select-dialog'

const channelSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, '名称不能为空'),
  type: z.coerce.number(),
  key: z.string(),
  base_url: z.string().optional().default(''),
  models: z.string().min(1, '请至少选择一个模型'),
  group: z.string().default('default'),
  priority: z.coerce.number().default(0),
  weight: z.coerce.number().default(0),
  test_model: z.string().optional().default(''),
  other: z.string().optional().default(''),
  tag: z.string().optional().default(''),
}).refine((data) => {
  if (!data.id && !data.key) {
    return false
  }
  return true
}, {
  message: '新建渠道必须填写密钥',
  path: ['key'],
})

type ChannelFormValues = z.infer<typeof channelSchema>

export function ChannelSheet({
  open,
  onOpenChange,
  editingChannel,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingChannel?: any
  onSuccess: () => void
}) {
  const [fetchedModels, setFetchedModels] = useState<string[]>([])
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false)

  const form = useForm<ChannelFormValues>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: '',
      type: 1,
      key: '',
      base_url: '',
      models: '',
      group: 'default',
      priority: 0,
      weight: 0,
      test_model: '',
      other: '',
      tag: '',
    },
  })

  useEffect(() => {
    if (editingChannel) {
      form.reset({
        id: editingChannel.id,
        name: editingChannel.name || '',
        type: editingChannel.type || 1,
        key: editingChannel.key || '',
        base_url: editingChannel.base_url || '',
        models: editingChannel.models || '',
        group: editingChannel.group || 'default',
        priority: editingChannel.priority || 0,
        weight: editingChannel.weight || 0,
        test_model: editingChannel.test_model || '',
        other: editingChannel.other || '',
        tag: editingChannel.tag || '',
      })
    }
    else {
      form.reset({
        name: '',
        type: 1,
        key: '',
        base_url: '',
        models: '',
        group: 'default',
        priority: 0,
        weight: 0,
        test_model: '',
        other: '',
        tag: '',
      })
    }
  }, [editingChannel, form])

  async function onSubmit(values: ChannelFormValues) {
    const result = await saveChannel(values)
    if (result.success) {
      toast.success(values.id ? '更新成功' : '添加成功')
      onOpenChange(false)
      onSuccess()
    }
    else {
      toast.error(result.message || '操作失败')
    }
  }

  const handleModelAdd = (model: string) => {
    const currentModels = form.getValues('models').split(',').filter(Boolean)
    if (!currentModels.includes(model)) {
      form.setValue('models', [...currentModels, model].join(','))
    }
  }

  const handleModelRemove = (model: string) => {
    const currentModels = form.getValues('models').split(',').filter(Boolean)
    form.setValue('models', currentModels.filter(m => m !== model).join(','))
  }

  const handleFetchModels = async () => {
    const type = form.getValues('type')
    const key = form.getValues('key')
    const baseUrl = form.getValues('base_url')

    const loadingToast = toast.loading('正在获取模型列表...')
    try {
      let result
      if (editingChannel?.id) {
        result = await fetchChannelModelsById(editingChannel.id)
      }
      else {
        if (!key) {
          toast.error('请先填入密钥')
          toast.dismiss(loadingToast)
          return
        }
        result = await fetchChannelModels({ type, key, base_url: baseUrl })
      }

      if (result.success && Array.isArray(result.data)) {
        setFetchedModels(result.data)
        setIsSelectDialogOpen(true)
        toast.success(`成功获取 ${result.data.length} 个模型`)
      }
      else {
        toast.error(result.message || '获取失败')
      }
    }
    catch (e) {
      toast.error('网络错误')
    }
    finally {
      toast.dismiss(loadingToast)
    }
  }

  const handleSelectConfirm = (selected: string[]) => {
    const currentModels = form.getValues('models').split(',').filter(Boolean)
    const newModels = Array.from(new Set([...currentModels, ...selected]))
    form.setValue('models', newModels.join(','))
  }

  const handleCopyModels = () => {
    const models = form.getValues('models')
    if (!models) {
      toast.error('没有模型可以复制')
      return
    }
    navigator.clipboard.writeText(models)
    toast.success('已复制到剪贴板')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editingChannel ? '编辑渠道' : '添加渠道'}</SheetTitle>
          <SheetDescription>
            配置渠道的基本信息、模型和密钥。
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>渠道类型</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)} value={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择渠道类型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {CHANNEL_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>渠道名称</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：OpenAI-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="base_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>代理地址</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.openai.com (可选)" {...field} />
                  </FormControl>
                  <FormDescription>如果不填写，将使用默认地址</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="models"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>模型</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder="输入模型名称并回车添加，或逗号分隔"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const val = (e.currentTarget as HTMLInputElement).value.trim()
                            if (val) {
                              handleModelAdd(val)
                              e.currentTarget.value = ''
                            }
                          }
                        }}
                      />
                      <div className="flex flex-wrap gap-1 min-h-[40px] p-2 border rounded-md bg-slate-50">
                        {field.value.split(',').filter(Boolean).map(model => (
                          <Badge key={model} variant="secondary" className="flex items-center gap-1">
                            {model}
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-red-500"
                              onClick={() => handleModelRemove(model)}
                            />
                          </Badge>
                        ))}
                        {!field.value && <span className="text-xs text-muted-foreground">未选择模型</span>}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px]"
                          onClick={handleFetchModels}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          {' '}
                          获取模型列表
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px]"
                          onClick={() => form.setValue('models', '')}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          {' '}
                          清除所有模型
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px]"
                          onClick={handleCopyModels}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {' '}
                          复制所有模型
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密钥 (Key)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="请输入渠道对应的鉴权密钥" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分组</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>逗号分隔</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标签</FormLabel>
                    <FormControl>
                      <Input placeholder="渠道标签" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>优先级</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>权重</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="test_model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>测试模型</FormLabel>
                  <FormControl>
                    <Input placeholder="测试渠道时使用的模型 (可选)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="other"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>其他配置 (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="部分渠道需要的额外配置，例如 Azure 的版本等"
                      className="font-mono text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <Button type="submit" className="w-full">保存渠道</Button>
            </SheetFooter>
          </form>
        </Form>
        <ModelSelectDialog
          open={isSelectDialogOpen}
          onOpenChange={setIsSelectDialogOpen}
          models={fetchedModels}
          selectedModels={form.getValues('models').split(',').filter(Boolean)}
          onConfirm={handleSelectConfirm}
        />
      </SheetContent>
    </Sheet>
  )
}
