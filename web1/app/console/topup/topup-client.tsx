'use client'

import { Coins, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PayPalRecharge } from './paypal-recharge'
import { renderQuota } from '@/lib/utils'

type TopupInfo = {
  enable_online_topup: boolean
  enable_stripe_topup: boolean
  min_topup: number
  pay_methods: any[] 
  amount_options: number[]
  discount: Record<string, number>
}

type TopupClientProps = {
  user: any
  topupInfo: TopupInfo | null
}

export function TopupClient({
  user,
  topupInfo,
}: TopupClientProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">钱包管理</h1>
        <p className="text-muted-foreground">管理您的账户余额和充值</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Balance Card */}
        <Card className="p-8 flex flex-col items-center justify-center text-center shadow-md lg:col-span-1 bg-gradient-to-b from-background to-muted/20 border-primary/10">
          <div className="mb-6">
            <Avatar className="w-20 h-20 border-2 border-primary/20 shadow-inner">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {user?.username?.slice(0, 2).toUpperCase() || <UserIcon size={32} />}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-1 mb-8">
            <h2 className="text-xl font-bold tracking-tight">{user?.username}</h2>
            <p className="text-sm text-muted-foreground">{user?.email || '未绑定邮箱'}</p>
          </div>

          <div className="w-full h-px bg-border/60 mb-8" />

          <div className="w-full space-y-4">
            <div className="flex items-center justify-between px-4 py-3 bg-background rounded-xl border shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Coins size={18} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">当前余额</span>
              </div>
              <span className="text-2xl font-black text-primary">
                {renderQuota(user?.quota || 0)}
              </span>
            </div>
            
            <div className="px-4 text-left">
              <p className="text-xs text-muted-foreground flex justify-between items-center">
                <span>精确额度</span>
                <span className="font-mono text-foreground/80">{user?.quota?.toLocaleString() || 0}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Topup Action Card */}
        <Card className="col-span-1 md:col-span-2 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 border-b pb-2">在线充值</h3>
          <div className="pt-2">
            <PayPalRecharge
              user={user}
              onSuccess={() => {
                router.refresh()
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
