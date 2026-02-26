import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LoginForm } from '@/components/login-form'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { api } from '@/lib/api'
import { buildPageMetadata } from '@/lib/seo'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return buildPageMetadata({
    locale,
    pathname: '/login',
    title: locale === 'zh' ? '登录' : 'Sign In',
    description: locale === 'zh' ? '登录 Broadscene 控制台。' : 'Sign in to your Broadscene console.',
    noIndex: true,
  })
}

export default async function LoginPage() {
  const t = await getTranslations('Page.Login')
  const statusRes = await api('/api/status')
  const statusJson = await statusRes.json()
  const status = statusJson.success ? statusJson.data : {}

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {t('title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <LoginForm status={status} />
      </Card>
    </div>
  )
}
