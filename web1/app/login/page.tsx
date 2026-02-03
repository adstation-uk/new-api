import { LoginForm } from '@/components/login-form'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            登录 New API
          </CardTitle>
          <CardDescription className="text-center">
            请输入您的凭据以访问控制台
          </CardDescription>
        </CardHeader>
        <LoginForm />
      </Card>
    </div>
  )
}
