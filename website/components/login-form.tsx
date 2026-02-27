'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { loginAction } from '@/actions/login-action'
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
import { trackLoginConversion } from '@/lib/ga-events'
import {
  onDiscordOAuthClicked,
  onGitHubOAuthClicked,
  onLinuxDOOAuthClicked,
  onOIDCClicked,
} from '@/lib/oauth'

function createLoginSchema(t: (key: string) => string) {
  return z.object({
    username: z
      .string()
      .min(1, t('errors.usernameRequired'))
      .max(20, t('errors.usernameMax')),
    password: z
      .string()
      .min(8, t('errors.passwordMin'))
      .max(20, t('errors.passwordMax')),
  })
}

type LoginFormValues = {
  username: string
  password: string
}

export function LoginForm({ status }: { status: any }) {
  const t = useTranslations('Common')
  const p = useTranslations('Page.Login')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const loginSchema = createLoginSchema(t)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('username', values.username)
      formData.append('password', values.password)

      const result = await loginAction(formData)

      if (result.success) {
        trackLoginConversion()
        toast.success(t('toast.loginSuccess'))
        router.push('/console')
        router.refresh()
      }
      else {
        toast.error(result.message || t('toast.loginFailed'))
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
                <FormLabel>{t('form.usernameOrEmail')}</FormLabel>
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? p('submitting') : t('action.login')}
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
                    onClick={() => {
                      localStorage.setItem('oauth_source', 'login')
                      onGitHubOAuthClicked(status.github_client_id, t)
                    }}
                  >
                    GitHub
                  </Button>
                )}
                {status?.linuxdo_oauth && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      localStorage.setItem('oauth_source', 'login')
                      onLinuxDOOAuthClicked(status.linuxdo_client_id, t)
                    }}
                  >
                    Linux DO
                  </Button>
                )}
                {status?.discord_oauth && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      localStorage.setItem('oauth_source', 'login')
                      onDiscordOAuthClicked(status.discord_client_id, t)
                    }}
                  >
                    Discord
                  </Button>
                )}
                {status?.oidc_enabled && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      localStorage.setItem('oauth_source', 'login')
                      onOIDCClicked(status.oidc_authorization_endpoint, status.oidc_client_id, t)
                    }}
                  >
                    OIDC
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="text-sm text-center text-muted-foreground">
            {p('noAccount')}
            {' '}
            <Link href="/register" className="text-primary hover:underline">
              {p('goRegister')}
            </Link>
          </div>
        </CardFooter>
      </form>
    </Form>
  )
}
