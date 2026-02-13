'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import {
  onDiscordOAuthClicked,
  onGitHubOAuthClicked,
  onLinuxDOOAuthClicked,
  onOIDCClicked,
} from '@/lib/oauth'

const loginSchema = z.object({
  username: z
    .string()
    .min(1, '请输入用户名')
    .max(20, '用户名长度不得超过 20 位'),
  password: z
    .string()
    .min(8, '密码长度不得小于 8 位')
    .max(20, '密码长度不得超过 20 位'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({ status }: { status: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        toast.success('登录成功')
        router.push('/console')
        router.refresh()
      }
      else {
        toast.error(result.message || '登录失败')
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
                <FormLabel>用户名 / 邮箱</FormLabel>
                <FormControl>
                  <Input placeholder="admin" {...field} />
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? '登录中...' : '登录'}
          </Button>

          {(status?.github_oauth || status?.discord_oauth || status?.linuxdo_oauth || status?.oidc_enabled) && (
            <div className="w-full space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    或者使用以下方式登录
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
            没有账号？
            {' '}
            <Link href="/register" className="text-primary hover:underline">
              立即注册
            </Link>
          </div>
        </CardFooter>
      </form>
    </Form>
  )
}
