'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Copy, Trash2, X, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('Page.Console.Channel.sheet')
  const [fetchedModels, setFetchedModels] = useState<string[]>([])
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false)

  const schema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, t('validation.nameRequired')),
    type: z.number(),
    key: z.string(),
    base_url: z.string().optional().default(''),
    models: z.string().min(1, t('validation.modelsRequired')),
    group: z.string().default('default'),
    priority: z.number().default(0),
    weight: z.number().default(0),
    test_model: z.string().optional().default(''),
    other: z.string().optional().default(''),
    tag: z.string().optional().default(''),
  }).refine((data) => {
    if (!data.id && !data.key) {
      return false
    }
    return true
  }, {
    message: t('validation.keyRequired'),
    path: ['key'],
  })

  type ChannelFormValues = z.infer<typeof schema>

  const form = useForm<ChannelFormValues>({
    resolver: zodResolver(schema),
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
      toast.success(values.id ? t('toast.updateSuccess') : t('toast.createSuccess'))
      onOpenChange(false)
      onSuccess()
    }
    else {
      toast.error(result.message || t('toast.submitFailed'))
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

    const loadingToast = toast.loading(t('toast.fetchingModels'))
    try {
      let result
      if (editingChannel?.id) {
        result = await fetchChannelModelsById(editingChannel.id)
      }
      else {
        if (!key) {
          toast.error(t('toast.keyRequiredFirst'))
          toast.dismiss(loadingToast)
          return
        }
        result = await fetchChannelModels({ type, key, base_url: baseUrl })
      }

      if (result.success && Array.isArray(result.data)) {
        setFetchedModels(result.data)
        setIsSelectDialogOpen(true)
        toast.success(t('toast.fetchModelsSuccess', { count: result.data.length }))
      }
      else {
        toast.error(result.message || t('toast.fetchFailed'))
      }
    }
    catch {
      toast.error(t('toast.networkError'))
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
      toast.error(t('toast.noModelsToCopy'))
      return
    }
    navigator.clipboard.writeText(models)
    toast.success(t('toast.copied'))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editingChannel ? t('titleEdit') : t('titleCreate')}</SheetTitle>
          <SheetDescription>
            {t('description')}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.type')}</FormLabel>
                  <Select onValueChange={v => field.onChange(Number(v))} defaultValue={String(field.value)} value={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('fields.typePlaceholder')} />
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
                  <FormLabel>{t('fields.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.namePlaceholder')} {...field} />
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
                  <FormLabel>{t('fields.baseUrl')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.baseUrlPlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('fields.baseUrlDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="models"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.models')}</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder={t('fields.modelsPlaceholder')}
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
                        {!field.value && <span className="text-xs text-muted-foreground">{t('fields.noModels')}</span>}
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
                          {t('actions.fetchModels')}
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
                          {t('actions.clearModels')}
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
                          {t('actions.copyModels')}
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
                  <FormLabel>{t('fields.key')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('fields.keyPlaceholder')} {...field} />
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
                    <FormLabel>{t('fields.group')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>{t('fields.groupDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.tag')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('fields.tagPlaceholder')} {...field} />
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
                    <FormLabel>{t('fields.priority')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={e => field.onChange(Number(e.target.value) || 0)}
                      />
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
                    <FormLabel>{t('fields.weight')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={e => field.onChange(Number(e.target.value) || 0)}
                      />
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
                  <FormLabel>{t('fields.testModel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.testModelPlaceholder')} {...field} />
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
                  <FormLabel>{t('fields.other')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('fields.otherPlaceholder')}
                      className="font-mono text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <Button type="submit" className="w-full">{t('actions.save')}</Button>
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
