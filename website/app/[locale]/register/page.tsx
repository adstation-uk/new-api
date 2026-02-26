import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { RegisterForm } from '@/components/register-form'
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
    pathname: '/register',
    title: locale === 'zh' ? '注册' : 'Sign Up',
    description: locale === 'zh' ? '创建 Broadscene 账号并开始调用 API。' : 'Create a Broadscene account and start using API models.',
    noIndex: true,
  })
}

export default async function RegisterPage() {
  const t = await getTranslations('Page.Register')
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
        <Suspense fallback={<div className="p-6 text-center">{t('loading')}</div>}>
          <RegisterForm status={status} />
        </Suspense>
      </Card>
    </div>
  )
}
