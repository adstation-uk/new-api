'use client'

import {
  Copy,
  Github,
  Mail,
  RefreshCw,
} from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import * as React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  onDiscordOAuthClicked,
  onGitHubOAuthClicked,
  onLinuxDOOAuthClicked,
  onOIDCClicked,
} from '@/lib/oauth'
import { cn } from '@/lib/utils'
import { generateTokenAction } from './actions'

type UserState = {
  id: number
  username: string
  display_name: string
  email: string
  role: number
  group: string
  quota: number
  github_id: string
  wechat_id: string
  telegram_id: string
  linux_do_id: string
  discord_id: string
  oidc_id: string
}

type StatusState = {
  github_oauth: boolean
  github_client_id: string
  wechat_login: boolean
  wechat_qrcode: string
  email_verification: boolean
  turnstile_check: boolean
  turnstile_site_key: string
  discord_oauth: boolean
  discord_client_id: string
  linuxdo_oauth: boolean
  linuxdo_client_id: string
  telegram_oauth: boolean
  telegram_bot_name: string
  oidc_enabled: boolean
  oidc_client_id: string
  oidc_authorization_endpoint: string
}

type PersonalClientProps = {
  user: UserState
  status: StatusState
  onlySecurity?: boolean
  onlyLogout?: boolean
  onlyTopup?: boolean
}

export function PersonalClient({
  user,
  status,
  onlySecurity,
  onlyLogout,
  onlyTopup,
}: PersonalClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [accessToken, setAccessToken] = useState('')

  const handleGenerateToken = async () => {
    setLoading(true)
    try {
      const data = await generateTokenAction()
      if (data.success) {
        setAccessToken(data.data)
        toast.success('访问令牌已生成')
      }
      else {
        toast.error(data.message || '生成失败')
      }
    }
    catch {
      toast.error('网络错误')
    }
    finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('已复制到剪贴板')
    }
    catch {
      toast.error('复制失败')
    }
  }

  if (onlyLogout) {
    return null
  }

  if (onlyTopup) {
    return (
      <Button
        variant="outline"
        onClick={() => router.push('/console/topup')}
        className="shrink-0"
      >
        去充值
      </Button>
    )
  }

  if (onlySecurity) {
    return (
      <Card className="flex flex-col shadow-sm">
        <CardHeader>
          <CardTitle>账户安全 & 访问</CardTitle>
          <CardDescription>管理您的账户绑定和访问令牌</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 flex-1">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              账号绑定
            </h4>

            {/* Email */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">邮箱</span>
                  <span className="text-xs text-muted-foreground">
                    {user.email || '未绑定'}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" disabled>
                {user.email ? '已绑定' : '去绑定'}
              </Button>
            </div>

            {/* GitHub */}
            {status.github_oauth && (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                <div className="flex items-center gap-3">
                  <Github className="h-5 w-5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">GitHub</span>
                    <span className="text-xs text-muted-foreground">
                      {user.github_id ? '已绑定' : '未绑定'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!!user.github_id}
                  onClick={() => onGitHubOAuthClicked(status.github_client_id)}
                >
                  {user.github_id ? '已绑定' : '绑定'}
                </Button>
              </div>
            )}

            {/* WeChat */}
            {status.wechat_login && (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 flex items-center justify-center font-bold text-xs bg-green-500 text-white rounded">
                    WC
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">微信</span>
                    <span className="text-xs text-muted-foreground">
                      {user.wechat_id ? '已绑定' : '未绑定'}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" disabled={!!user.wechat_id}>
                  {user.wechat_id ? '已绑定' : '绑定'}
                </Button>
              </div>
            )}

            {/* Discord */}
            {status.discord_oauth && (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 flex items-center justify-center font-bold text-xs bg-indigo-500 text-white rounded">
                    DC
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Discord</span>
                    <span className="text-xs text-muted-foreground">
                      {user.discord_id ? '已绑定' : '未绑定'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!!user.discord_id}
                  onClick={() => onDiscordOAuthClicked(status.discord_client_id)}
                >
                  {user.discord_id ? '已绑定' : '绑定'}
                </Button>
              </div>
            )}

            {/* LinuxDO */}
            {status.linuxdo_oauth && (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 flex items-center justify-center font-bold text-xs bg-orange-500 text-white rounded">
                    LD
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Linux DO</span>
                    <span className="text-xs text-muted-foreground">
                      {user.linux_do_id ? '已绑定' : '未绑定'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!!user.linux_do_id}
                  onClick={() => onLinuxDOOAuthClicked(status.linuxdo_client_id)}
                >
                  {user.linux_do_id ? '已绑定' : '绑定'}
                </Button>
              </div>
            )}

            {/* OIDC */}
            {status.oidc_enabled && (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 flex items-center justify-center font-bold text-xs bg-blue-500 text-white rounded">
                    ID
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">OIDC</span>
                    <span className="text-xs text-muted-foreground">
                      {user.oidc_id ? '已绑定' : '未绑定'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!!user.oidc_id}
                  onClick={() =>
                    onOIDCClicked(
                      status.oidc_authorization_endpoint,
                      status.oidc_client_id,
                    )}
                >
                  {user.oidc_id ? '已绑定' : '绑定'}
                </Button>
              </div>
            )}

            {/* Telegram */}
            {status.telegram_oauth && (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 flex items-center justify-center font-bold text-xs bg-sky-500 text-white rounded">
                    TG
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Telegram</span>
                    <span className="text-xs text-muted-foreground">
                      {user.telegram_id ? '已绑定' : '未绑定'}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" disabled={!!user.telegram_id}>
                  {user.telegram_id ? '已绑定' : '绑定'}
                </Button>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">
                访问令牌 (Access Token)
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateToken}
                disabled={loading}
              >
                <RefreshCw
                  className={cn('h-4 w-4 mr-1', loading && 'animate-spin')}
                />
                {accessToken ? '重新生成' : '生成'}
              </Button>
            </div>
            {accessToken
              ? (
                  <div className="relative">
                    <div className="p-3 bg-muted rounded-md font-mono text-xs break-all pr-10 border">
                      {accessToken}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => copyToClipboard(accessToken)}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                )
              : (
                  <div className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-md bg-muted/30">
                    点击生成获取用于 OpenAI 客户端连接的系统级令牌
                  </div>
                )}
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0 border-t bg-transparent">
          <div className="w-full flex gap-2 pt-6">
            <Button variant="outline" className="w-full">
              修改密码
            </Button>
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              删除账号
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return null
}
