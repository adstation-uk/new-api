'use client'

import { zodResolver } from '@hookform/resolvers/zod'
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

const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, '请输入用户名')
      .max(20, '用户名长度不得超过 20 位'),
    password: z
      .string()
      .min(8, '密码长度不得小于 8 位')
      .max(20, '密码长度不得超过 20 位'),
    password2: z
      .string()
      .min(8, '请再次输入密码')
      .max(20, '密码长度不得超过 20 位'),
  })
  .refine(data => data.password === data.password2, {
    message: '两次输入的密码不一致',
    path: ['password2'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm({ status }: { status: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        toast.success('注册成功，请登录')
        router.push('/login')
      }
      else {
        toast.error(result.message || '注册失败')
      }
    }
    catch {
      toast.error('网络错误')
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
                <FormLabel>用户名</FormLabel>
                <FormControl>
                  <Input placeholder="用户名" {...field} />
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
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
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
                <FormLabel>确认密码</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? '注册中...' : '注册'}
          </Button>

          {(status?.github_oauth || status?.discord_oauth || status?.linuxdo_oauth || status?.oidc_enabled) && (
            <div className="w-full space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    或者使用以下方式注册
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {status?.github_oauth && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => onGitHubOAuthClicked(status.github_client_id)}
                  >
                    GitHub
                  </Button>
                )}
                {status?.linuxdo_oauth && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => onLinuxDOOAuthClicked(status.linuxdo_client_id)}
                  >
                    Linux DO
                  </Button>
                )}
                {status?.discord_oauth && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => onDiscordOAuthClicked(status.discord_client_id)}
                  >
                    Discord
                  </Button>
                )}
                {status?.oidc_enabled && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => onOIDCClicked(status.oidc_authorization_endpoint, status.oidc_client_id)}
                  >
                    OIDC
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="text-sm text-center text-muted-foreground">
            已有账号？
            {' '}
            <Link href="/login" className="text-primary hover:underline">
              立即登录
            </Link>
          </div>
        </CardFooter>
      </form>
    </Form>
  )
}
