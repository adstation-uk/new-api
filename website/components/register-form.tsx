'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { registerAction } from '@/actions/register-action'
import { Button } from '@/components/ui/button'
import { CardContent, CardFooter } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Link, useRouter } from '@/i18n/navigation'
import {
  onDiscordOAuthClicked,
  onGitHubOAuthClicked,
  onLinuxDOOAuthClicked,
  onOIDCClicked,
} from '@/lib/oauth'

function createRegisterSchema(t: (key: string) => string) {
  return z
    .object({
      username: z
        .string()
        .min(1, t('errors.usernameRequired'))
        .max(20, t('errors.usernameMax')),
      password: z
        .string()
        .min(8, t('errors.passwordMin'))
        .max(20, t('errors.passwordMax')),
      password2: z
        .string()
        .min(8, t('errors.passwordConfirmRequired'))
        .max(20, t('errors.passwordMax')),
    })
    .refine(data => data.password === data.password2, {
      message: t('errors.passwordMismatch'),
      path: ['password2'],
    })
}

type RegisterFormValues = {
  username: string
  password: string
  password2: string
}

export function RegisterForm({ status }: { status: any }) {
  const t = useTranslations('Common')
  const p = useTranslations('Page.Register')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const registerSchema = createRegisterSchema(t)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
      password2: '',
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('username', values.username)
      formData.append('password', values.password)
      formData.append('password2', values.password2)

      const aff = searchParams.get('aff')
      if (aff) {
        formData.append('aff_code', aff)
      }

      const result = await registerAction(formData)

      if (result.success) {
        toast.success(t('toast.registerSuccessAndLogin'))
        router.push('/login')
      }
      else {
        toast.error(result.message || t('toast.registerFailed'))
      }
    }
    catch {
      toast.error(t('errors.network'))
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>{t('form.username')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('form.usernamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>{t('form.password')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t('form.passwordPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password2"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>{t('form.confirmPassword')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t('form.confirmPasswordPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? p('submitting') : t('action.register')}
          </Button>

          {(status?.github_oauth || status?.discord_oauth || status?.linuxdo_oauth || status?.oidc_enabled) && (
            <div className="w-full space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {p('oauthDivider')}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {status?.github_oauth && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => onGitHubOAuthClicked(status.github_client_id, t)}
                  >
                    GitHub
                  </Button>
                )}
                {status?.linuxdo_oauth && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => onLinuxDOOAuthClicked(status.linuxdo_client_id, t)}
                  >
                    Linux DO
                  </Button>
                )}
                {status?.discord_oauth && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => onDiscordOAuthClicked(status.discord_client_id, t)}
                  >
                    Discord
                  </Button>
                )}
                {status?.oidc_enabled && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => onOIDCClicked(status.oidc_authorization_endpoint, status.oidc_client_id, t)}
                  >
                    OIDC
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="text-sm text-center text-muted-foreground">
            {p('hasAccount')}
            {' '}
            <Link href="/login" className="text-primary hover:underline">
              {p('goLogin')}
            </Link>
          </div>
        </CardFooter>
      </form>
    </Form>
  )
}
