'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { ModelIcon } from '@/components/model-icon'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { saveModel } from './actions'

const modelSchema = z.object({
  id: z.number().optional(),
  model_name: z.string().min(1, '模型名称不能为空'),
  description: z.string().optional(),
  icon: z.string().optional(),
  tags: z.string().optional(),
  vendor_id: z.coerce.number().min(1, '请选择供应商'),
  endpoints: z.string().optional(),
  status: z.number().default(1),
  sync_official: z.number().default(1),
  name_rule: z.number().default(0),
})

type ModelFormValues = z.infer<typeof modelSchema>

export function ModelsSheet({
  model,
  vendors,
  open,
  onOpenChange,
}: {
  model: any | null
  vendors: any[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const form = useForm<ModelFormValues>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      model_name: '',
      description: '',
      icon: '',
      tags: '',
      vendor_id: 0,
      endpoints: '',
      status: 1,
      sync_official: 1,
      name_rule: 0,
    },
  })

  React.useEffect(() => {
    if (model) {
      form.reset({
        id: model.id,
        model_name: model.model_name,
        description: model.description || '',
        icon: model.icon || '',
        tags: model.tags || '',
        vendor_id: model.vendor_id || 0,
        endpoints: model.endpoints || '',
        status: model.status || 1,
        sync_official: model.sync_official || 1,
        name_rule: model.name_rule ?? 0,
      })
    }
    else {
      form.reset({
        model_name: '',
        description: '',
        icon: '',
        tags: '',
        vendor_id: 0,
        endpoints: '',
        status: 1,
        sync_official: 1,
        name_rule: 0,
      })
    }
  }, [model, form])

  async function onSubmit(values: ModelFormValues) {
    const loadingToast = toast.loading(model ? '正在更新模型...' : '正在创建模型...')
    try {
      const result = await saveModel(values)
      if (result.success) {
        toast.success(model ? '更新成功' : '创建成功')
        onOpenChange(false)
      }
      else {
        toast.error(result.message || '操作失败')
      }
    }
    catch (e) {
      toast.error('网络请求失败')
    }
    finally {
      toast.dismiss(loadingToast)
    }
  }

  const selectedIcon = form.watch('icon')
  const selectedVendorId = form.watch('vendor_id')
  const selectedVendor = vendors.find(v => v.id === selectedVendorId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{model ? '编辑模型' : '添加模型'}</SheetTitle>
          <SheetDescription>
            配置模型的基础信息、聚合标签和官方同步设置。
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-6">
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="model_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>模型名称</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="如: gpt-4o-2024-05-13" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-20">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>预览</FormLabel>
                      <div className="flex flex-col items-center gap-2 px-3 py-2 border rounded-md bg-muted/20 min-h-[40px]">
                        <ModelIcon symbol={selectedIcon || selectedVendor?.icon || 'Layers'} size={32} />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="name_rule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称匹配类型</FormLabel>
                  <Select onValueChange={v => field.onChange(Number.parseInt(v))} value={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择名称匹配类型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">精确名称匹配</SelectItem>
                      <SelectItem value="1">前缀名称匹配</SelectItem>
                      <SelectItem value="2">包含名称匹配</SelectItem>
                      <SelectItem value="3">后缀名称匹配</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    匹配优先级：精确 &gt; 前缀 &gt; 后缀 &gt; 包含
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vendor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>供应商</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择模型所属供应商" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vendors.map(v => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          <div className="flex items-center gap-2">
                            <ModelIcon symbol={v.icon || 'Layers'} size={14} />
                            {v.name}
                          </div>
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
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>自定义图标 (可选)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="输入 @lobehub/icons 图标 ID" />
                  </FormControl>
                  <FormDescription>留空则自动使用供应商图标</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标签 / 别名 (逗号分隔)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="如: gpt-4o, chat, vision" />
                  </FormControl>
                  <FormDescription>模型会匹配这些标签作为别名</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>模型说明</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="简要描述模型的能力和用途" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/10">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0 gap-2">
                    <div className="space-y-0.5">
                      <FormLabel>启用模型</FormLabel>
                      <div className="text-[10px] text-muted-foreground">控制模型是否在列表中可见</div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 1}
                        onCheckedChange={c => field.onChange(c ? 1 : 2)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sync_official"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0 gap-2">
                    <div className="space-y-0.5">
                      <FormLabel>官方同步</FormLabel>
                      <div className="text-[10px] text-muted-foreground">是否允许通过官方 API 自动发现</div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 1}
                        onCheckedChange={c => field.onChange(c ? 1 : 0)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="endpoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>自定义端点 (JSON 格式)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="font-mono text-xs h-24"
                      placeholder='{"openai": "https://api.openai.com/v1"}'
                    />
                  </FormControl>
                  <FormDescription>为特定供应商设置覆盖原始地址的 URL</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-2">
              <Button type="submit" className="w-full">保存模型信息</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
