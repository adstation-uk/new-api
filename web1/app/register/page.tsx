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
  const statusRes = await api('/api/status')
  const statusJson = await statusRes.json()
  const status = statusJson.success ? statusJson.data : {}

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            注册 New API
          </CardTitle>
          <CardDescription className="text-center">
            创建一个新账号以开始使用
          </CardDescription>
        </CardHeader>
        <Suspense fallback={<div className="p-6 text-center">加载中...</div>}>
          <RegisterForm status={status} />
        </Suspense>
      </Card>
    </div>
  )
}
