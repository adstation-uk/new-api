'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
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

type UserFormValues = {
  id?: number
  username: string
  display_name?: string
  password?: string
  quota: number
  group: string
  remark?: string
}

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
  const t = useTranslations('Page.Console.User.sheet')
  const commonT = useTranslations('Common')
  const userSchema = React.useMemo(() => z.object({
    id: z.number().optional(),
    username: z.string().min(1, t('validation.usernameRequired')),
    display_name: z.string().optional(),
    password: z.string().optional(),
    quota: z.coerce.number().min(0, t('validation.quotaNonNegative')),
    group: z.string().default('default'),
    remark: z.string().optional(),
  }), [t])

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
    const loadingToast = toast.loading(user ? t('toast.updating') : t('toast.creating'))
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
        toast.success(user ? t('toast.updateSuccess') : t('toast.createSuccess'))
        onOpenChange(false)
      }
      else {
        toast.error(result.message || (user ? t('toast.updateFailed') : t('toast.createFailed')))
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{user ? t('titleEdit') : t('titleCreate')}</SheetTitle>
          <SheetDescription>
            {t('description')}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.username')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('fields.usernamePlaceholder')} />
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
                  <FormLabel>{t('fields.displayName')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('fields.displayNamePlaceholder')} />
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
                  <FormLabel>{t('fields.password')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder={t('fields.passwordPlaceholder')} />
                  </FormControl>
                  <FormDescription>{t('fields.passwordDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.quota')}</FormLabel>
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
                  <FormLabel>{t('fields.group')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('fields.groupPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="default">{t('group.default')}</SelectItem>
                      <SelectItem value="vip">{t('group.vip')}</SelectItem>
                      <SelectItem value="svip">{t('group.svip')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('fields.groupDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.remark')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('fields.remarkPlaceholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <Button type="submit">{t('save')}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
