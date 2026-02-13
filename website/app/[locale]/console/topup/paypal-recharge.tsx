'use client'

import { CheckCircle } from 'lucide-react'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn, renderQuota } from '@/lib/utils'

const QUOTA_PER_UNIT = 500000
const PAYPAL_CLIENT_ID
  = 'ARZHtnqotObgNjK7RXfvlGf39QY5NDupFJbEqjyIMkRL0LQYjX9vTF8UXoxW_xj9Z8PwV_IprsCVUQMY'
const API_BASE = 'https://aiapi.tnt-pub.com'

const packages = [
  { amount: 5 },
  { amount: 10 },
  { amount: 20, highlight: true },
  { amount: 50 },
  { amount: 100, bonus: 0.05 },
  { amount: 500, bonus: 0.1 },
]

declare global {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Window {
    paypal: any
    gtag?: (...args: any[]) => void
  }
}

export function PayPalRecharge({
  user,
  onSuccess,
}: {
  user: any
  onSuccess: () => void
}) {
  const [selectedPackage, setSelectedPackage] = useState(
    packages.find(p => p.highlight) || packages[0],
  )
  const [showModal, setShowModal] = useState(false)
  const [paypalLoaded, setPaypalLoaded] = useState(false)

  const handlePayClick = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: 'AW-17369711139/XsEZCJSPlugbEKOEw9pA',
        value: 1.0,
        currency: 'USD',
      })
    }
    setShowModal(true)
  }

  useEffect(() => {
    if (typeof document === 'undefined')
      return

    if (!document.querySelector('#paypal-sdk')) {
      const script = document.createElement('script')
      script.id = 'paypal-sdk'
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`
      script.onload = () => setPaypalLoaded(true)
      script.onerror = () => {
        toast.error('加载 PayPal 支付模块失败')
      }
      document.body.appendChild(script)
    }
    else if (window.paypal) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setPaypalLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (showModal && paypalLoaded && selectedPackage && window.paypal) {
      const containerId = 'paypal-button-container'
      const timeoutId = setTimeout(() => {
        const container = document.getElementById(containerId)
        if (container) {
          container.innerHTML = ''
          try {
            window.paypal
              .Buttons({
                createOrder: async (_data: any, _actions: any) => {
                  try {
                    const response = await fetch(
                      `${API_BASE}/api/paypal/orders`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: user?.id,
                          cart: [
                            {
                              id: 'topup',
                              quantity: selectedPackage.amount,
                            },
                          ],
                        }),
                      },
                    )
                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({}))
                      throw new Error(errorData.message || '网络响应不正常')
                    }
                    const order = await response.json()
                    return order.id
                  }
                  catch (err: any) {
                    toast.error(`创建订单失败: ${err.message}`)
                    throw err
                  }
                },
                onApprove: async (data: any, actions: any) => {
                  try {
                    const response = await fetch(
                      `${API_BASE}/api/paypal/orders/${data.orderID}/capture`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      },
                    )

                    if (!response.ok)
                      throw new Error('支付捕获失败')

                    const orderData = await response.json()
                    const errorDetail = orderData?.details?.[0]

                    if (errorDetail?.issue === 'INSTRUMENT_DECLINED') {
                      return actions.restart()
                    }
                    else if (errorDetail) {
                      throw new Error(
                        `${errorDetail.description} (${orderData.debug_id})`,
                      )
                    }
                    else if (!orderData.purchase_units) {
                      throw new Error(JSON.stringify(orderData))
                    }
                    else {
                      if (typeof window.gtag === 'function') {
                        window.gtag('event', 'conversion', {
                          send_to: 'AW-17369711139/WmDvCO3Rwt8bEKOEw9pA',
                          value: selectedPackage.amount,
                          currency: 'USD',
                          transaction_id: data.orderID,
                        })
                      }
                      setShowModal(false)
                      toast.success('支付成功！余额已更新。')
                      onSuccess()
                    }
                  }
                  catch (err: any) {
                    console.error('Capture Error:', err)
                    toast.error(`支付捕获失败: ${err.message}`)
                  }
                },
                onError: (err: any) => {
                  console.error('PayPal Error:', err)
                  toast.error('PayPal 遇到错误。')
                },
              })
              .render(`#${containerId}`)
          }
          catch (err) {
            console.error('PayPal Render Error:', err)
          }
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [showModal, paypalLoaded, selectedPackage, user, onSuccess])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map(pkg => (
          <Card
            key={pkg.amount}
            onClick={() => setSelectedPackage(pkg)}
            className={cn(
              'relative cursor-pointer transition-all hover:border-primary/50 overflow-hidden border-2',
              selectedPackage.amount === pkg.amount
                ? 'border-primary shadow-md bg-accent/5'
                : 'border-muted',
            )}
          >
            {pkg.highlight && (
              <div className="absolute top-0 left-0 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-br-md">
                热门选择
              </div>
            )}
            <div className="p-5 flex flex-col h-full justify-between gap-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-2xl font-black">
                    {renderQuota(
                      pkg.amount * QUOTA_PER_UNIT * (1 + (pkg.bonus || 0)),
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>
                      支付 $
                      {pkg.amount}
                      {' '}
                      USD
                    </span>
                  </div>
                </div>
                {pkg.bonus && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">
                    +
                    {pkg.bonus * 100}
                    % 额外赠送
                  </div>
                )}
              </div>
            </div>
            {selectedPackage.amount === pkg.amount && (
              <div className="absolute bottom-0 right-0 p-1">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center sm:flex-row sm:justify-between gap-4 p-4 rounded-xl border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase">
              技术支持
            </span>
            <span className="font-black text-[#003087] dark:text-[#0070ba] italic text-xl">
              PayPal
            </span>
          </div>
        </div>
        <Button
          size="lg"
          onClick={handlePayClick}
          className="w-full sm:w-auto px-10 font-bold"
        >
          立即支付
        </Button>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认充值</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center text-center">
            <div className="mb-8">
              <p className="text-muted-foreground text-sm mb-2">充值额度</p>
              <div className="text-4xl font-black">
                {renderQuota(
                  selectedPackage.amount
                  * QUOTA_PER_UNIT
                  * (1 + (selectedPackage.bonus || 0)),
                )}
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="text-sm font-medium">
                  支付金额: $
                  {selectedPackage.amount}
                  {' '}
                  USD
                </div>
                {selectedPackage.bonus && (
                  <div className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-600">
                    +
                    {selectedPackage.bonus * 100}
                    % Bonus
                  </div>
                )}
              </div>
            </div>

            <div
              id="paypal-button-container"
              className="w-full min-h-[150px] flex items-center justify-center border rounded-xl bg-background p-6"
            >
              {!paypalLoaded && (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <span className="text-xs">加载支付选项...</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
