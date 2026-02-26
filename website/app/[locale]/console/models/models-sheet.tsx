'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
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

type ModelFormValues = {
  id?: number
  model_name: string
  description?: string
  icon?: string
  tags?: string
  vendor_id: number
  endpoints?: string
  status: number
  sync_official: number
  name_rule: number
}

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
  const t = useTranslations('Page.Console.Models.sheet')
  const commonT = useTranslations('Common')
  const modelSchema = React.useMemo(() => z.object({
    id: z.number().optional(),
    model_name: z.string().min(1, t('validation.modelNameRequired')),
    description: z.string().optional(),
    icon: z.string().optional(),
    tags: z.string().optional(),
    vendor_id: z.number().min(1, t('validation.vendorRequired')),
    endpoints: z.string().optional(),
    status: z.number().default(1),
    sync_official: z.number().default(1),
    name_rule: z.number().default(0),
  }), [t])

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
    const loadingToast = toast.loading(model ? t('toast.updating') : t('toast.creating'))
    try {
      const result = await saveModel(values)
      if (result.success) {
        toast.success(model ? t('toast.updateSuccess') : t('toast.createSuccess'))
        onOpenChange(false)
      }
      else {
        toast.error(result.message || t('toast.submitFailed'))
      }
    }
    catch {
      toast.error(commonT('errors.network'))
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
          <SheetTitle>{model ? t('titleEdit') : t('titleCreate')}</SheetTitle>
          <SheetDescription>
            {t('description')}
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
                      <FormLabel>{t('fields.modelName')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('fields.modelNamePlaceholder')} />
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
                  render={() => (
                    <FormItem>
                      <FormLabel>{t('fields.preview')}</FormLabel>
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
                  <FormLabel>{t('fields.nameRule')}</FormLabel>
                  <Select onValueChange={v => field.onChange(Number.parseInt(v))} value={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('fields.nameRulePlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">{t('nameRule.exact')}</SelectItem>
                      <SelectItem value="1">{t('nameRule.prefix')}</SelectItem>
                      <SelectItem value="2">{t('nameRule.contains')}</SelectItem>
                      <SelectItem value="3">{t('nameRule.suffix')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    {t('nameRule.description')}
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
                  <FormLabel>{t('fields.vendor')}</FormLabel>
                  <Select onValueChange={v => field.onChange(Number(v))} value={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('fields.vendorPlaceholder')} />
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
                  <FormLabel>{t('fields.icon')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('fields.iconPlaceholder')} />
                  </FormControl>
                  <FormDescription>{t('fields.iconDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.tags')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('fields.tagsPlaceholder')} />
                  </FormControl>
                  <FormDescription>{t('fields.tagsDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.description')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t('fields.descriptionPlaceholder')} />
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
                      <FormLabel>{t('fields.status')}</FormLabel>
                      <div className="text-[10px] text-muted-foreground">{t('fields.statusDescription')}</div>
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
                      <FormLabel>{t('fields.syncOfficial')}</FormLabel>
                      <div className="text-[10px] text-muted-foreground">{t('fields.syncOfficialDescription')}</div>
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
                  <FormLabel>{t('fields.endpoints')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="font-mono text-xs h-24"
                      placeholder='{"openai": "https://api.openai.com/v1"}'
                    />
                  </FormControl>
                  <FormDescription>{t('fields.endpointsDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-2">
              <Button type="submit" className="w-full">{t('save')}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
