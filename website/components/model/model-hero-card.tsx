'use client'

import { Check, ChevronLeft, Copy, Sparkles, Zap } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'

type ModelHeroCardProps = {
  modelId: string
  modelName: string
  modelCategory: string
  modelProvider?: string
  modelDescription?: string
  modelCapabilities?: string[]
  price?: string
  marketPrice?: string
  billingType?: 'token' | 'request'
  billingUnit?: string
  backHref?: string
}

export function ModelHeroCard({
  modelId,
  modelName,
  modelCategory,
  modelProvider,
  modelDescription,
  modelCapabilities,
  price,
  marketPrice,
  billingType,
  billingUnit,
  backHref = '/pricing',
}: ModelHeroCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyModelId = async () => {
    try {
      await navigator.clipboard.writeText(modelId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    }
    catch {
      setCopied(false)
    }
  }

  const billingLabel = billingType === 'request' ? '按次数计费' : '按 Token 计费'

  return (
    <section className="w-full border-b bg-muted/30">
      <div className="container mx-auto px-6 py-10 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="space-y-5">
            <div className="space-y-3">
              <Link
                href={backHref}
                className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to pricing
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{modelName}</h1>
                <Badge variant="secondary" className="uppercase">{modelCategory}</Badge>
                {modelProvider && <Badge variant="outline">{modelProvider}</Badge>}
                {billingType && <Badge variant="outline">{billingLabel}</Badge>}
              </div>

              {modelDescription && (
                <p className="max-w-4xl text-sm text-muted-foreground md:text-base">
                  {modelDescription}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="rounded-md border bg-background px-3 py-1.5">
                <span className="text-muted-foreground">Model ID: </span>
                <span className="font-medium">{modelId}</span>
              </div>
              <div className="rounded-md border bg-background px-3 py-1.5">
                <span className="text-muted-foreground">计费方式: </span>
                <span className="font-medium">{billingLabel}</span>
                {billingUnit && (
                  <span className="text-muted-foreground">
                    （
                    {billingUnit}
                    ）
                  </span>
                )}
              </div>
            </div>

            {modelCapabilities?.length
              ? (
                  <div className="flex flex-wrap gap-2">
                    {modelCapabilities.map(cap => (
                      <Badge key={cap} variant="outline">
                        <Sparkles className="mr-1 h-3 w-3" />
                        {cap}
                      </Badge>
                    ))}
                  </div>
                )
              : null}

            <div>
              <Badge variant="outline">
                <Zap className="mr-1 h-3 w-3" />
                OpenAI-compatible endpoint with a single model key
              </Badge>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">价格信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">我们的价格</p>
                <p className="mt-1 text-2xl font-bold">
                  {price || '联系销售'}
                  {billingUnit ? <span className="ml-1 text-sm font-medium text-muted-foreground">{billingUnit}</span> : null}
                </p>
              </div>

              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">市场价格</p>
                <p className="mt-1 text-lg font-semibold text-muted-foreground">
                  {marketPrice || 'N/A'}
                  {billingUnit ? <span className="ml-1 text-xs">{billingUnit}</span> : null}
                </p>
              </div>

              <Button type="button" variant="default" className="w-full" onClick={handleCopyModelId}>
                {copied
                  ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        已复制模型 ID
                      </>
                    )
                  : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        复制模型 ID
                      </>
                    )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
