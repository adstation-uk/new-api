import { User as UserIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
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

function getRoleLabel(role: number, t: (key: string) => string) {
  switch (role) {
    case 1:
      return t('role.user')
    case 10:
      return t('role.admin')
    case 100:
      return t('role.superAdmin')
    default:
      return t('role.unknown')
  }
}

export default async function PersonalPage() {
  const t = await getTranslations('Page.Console.Personal.page')
  const { user, status } = await getPersonalData()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>
        <PersonalClient user={user} status={status || {}} onlyLogout />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card - Server Component Part */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t('profile.title')}</CardTitle>
            <CardDescription>{t('profile.description')}</CardDescription>
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
                  <Badge variant="secondary" className="px-3">{getRoleLabel(user.role, t)}</Badge>
                  <Badge variant="outline" className="px-3">{user.group}</Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-6 px-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-muted-foreground px-0.5">{t('profile.userId')}</span>
                <div className="p-3 rounded-lg bg-background border font-mono text-sm leading-none tabular-nums">
                  {user.id}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-muted-foreground px-0.5">{t('profile.username')}</span>
                <div className="p-3 rounded-lg bg-background border text-sm leading-none">
                  {user.username}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-muted-foreground px-0.5">{t('profile.balance')}</span>
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
