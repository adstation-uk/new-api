import { User as UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { PersonalClient } from './personal-client'

async function getPersonalData() {
  try {
    const [userRes, statusRes] = await Promise.all([
      api('/api/user/self'),
      api('/api/status'),
    ])

    const userJson = await userRes.json()
    const statusJson = await statusRes.json()

    return {
      user: userJson.success ? userJson.data : null,
      status: statusJson.success ? statusJson.data : null,
    }
  }
  catch (e) {
    console.error('Failed to fetch personal data', e)
    return { user: null, status: null }
  }
}

function getRoleLabel(role: number) {
  switch (role) {
    case 1:
      return '普通用户'
    case 10:
      return '管理员'
    case 100:
      return '超级管理员'
    default:
      return '未知'
  }
}

export default async function PersonalPage() {
  const { user, status } = await getPersonalData()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">个人设置</h1>
          <p className="text-muted-foreground mt-1">
            管理您的个人资料和账户安全
          </p>
        </div>
        <PersonalClient user={user} status={status || {}} onlyLogout />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card - Server Component Part */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>您的公开个人资料信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center gap-6 p-4 rounded-xl bg-muted/30 border border-border/50">
              <Avatar className="h-20 w-20 border-2 border-primary/10 shadow-sm">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${user.username}.png`}
                />
                <AvatarFallback>
                  <UserIcon size={32} />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight">
                  {user.display_name || user.username}
                </h3>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="px-3">{getRoleLabel(user.role)}</Badge>
                  <Badge variant="outline" className="px-3">{user.group}</Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-6 px-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-muted-foreground px-0.5">用户 ID</span>
                <div className="p-3 rounded-lg bg-background border font-mono text-sm leading-none tabular-nums">
                  {user.id}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-muted-foreground px-0.5">用户名</span>
                <div className="p-3 rounded-lg bg-background border text-sm leading-none">
                  {user.username}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-muted-foreground px-0.5">当前余额</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 rounded-lg bg-background border font-mono text-sm font-bold text-primary leading-none">
                    $
                    {(user.quota / 500000).toFixed(6)}
                  </div>
                  <PersonalClient user={user} status={status || {}} onlyTopup />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Card - Client Component Part */}
        <PersonalClient user={user} status={status || {}} onlySecurity />
      </div>
    </div>
  )
}
