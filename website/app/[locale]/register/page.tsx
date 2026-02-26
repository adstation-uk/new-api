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
