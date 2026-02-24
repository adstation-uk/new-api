import {
  ExternalLink,
  Search,
} from 'lucide-react'
import { ModelIcon } from '@/components/model-icon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { modelConfig } from '@/config/models'
import { Link } from '@/i18n/navigation'

type PricingPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams
  const keyword = (params.keyword as string)?.toLowerCase() || ''

  const allModels = Object.entries(modelConfig).map(([id, config]) => {
    const billingType = config.billing_type || (config.category === 'video' || config.category === 'music' ? 'request' : 'token')
    const billingUnit = config.billing_unit || (billingType === 'token' ? '/1K tokens' : (config.category === 'music' ? '/track' : '/video'))

    return {
      id,
      ...config,
      displayName: config.name || id,
      category: config.category || 'chat',
      vendor: config.provider || 'Other',
      billingType,
      billingUnit,
    }
  })

  const filteredModels = allModels.filter((m: any) => {
    const matchesKeyword = !keyword
      || m.displayName.toLowerCase().includes(keyword)
      || m.id.toLowerCase().includes(keyword)
      || m.vendor.toLowerCase().includes(keyword)
      || m.billingType.toLowerCase().includes(keyword)
    return matchesKeyword
  })

  const groups: Record<string, any[]> = {}
  filteredModels.forEach((model: any) => {
    const groupName = model.vendor
    if (!groups[groupName])
      groups[groupName] = []
    groups[groupName].push(model)
  })

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">定价</h1>
        <p className="text-muted-foreground text-lg">
          精选顶级 AI 模型，手动维护，透明简单。
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form className="relative flex-1 md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="keyword"
              placeholder="搜索模型、分类、提供商或计费方式..."
              className="h-10 pl-9"
              defaultValue={keyword}
            />
          </form>
          <Link href="/models">
            <Button variant="outline" className="rounded-xl border-slate-200">
              全部模型库
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groups).map(([groupName, groupModels]) => (
          <div key={groupName} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b bg-muted/20 px-6 py-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{groupName}</h3>
                <span className="text-xs font-medium text-muted-foreground">
                  {groupModels.length}
                  {' '}
                  个模型
                </span>
              </div>
            </div>
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[40%] text-xs font-semibold py-4">模型</TableHead>
                  <TableHead className="text-xs font-semibold py-4 text-center">分类</TableHead>
                  <TableHead className="text-xs font-semibold py-4 text-right">我们的价格</TableHead>
                  <TableHead className="text-xs font-semibold py-4 text-right">市场价格</TableHead>
                  <TableHead className="text-xs font-semibold py-4 text-right">折扣</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupModels.map((model: any) => {
                  const ourPrice = Number.parseFloat((model.price || '0').replace('$', ''))
                  const marketPrice = Number.parseFloat((model.market_price || '0').replace('$', ''))
                  const discount = marketPrice > 0 ? ((1 - ourPrice / marketPrice) * 100).toFixed(0) : '0'

                  return (
                    <TableRow key={model.id} className="group transition-colors hover:bg-muted/20">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-muted rounded-lg">
                            <ModelIcon symbol={model.icon || model.id} className="w-6 h-6" />
                          </div>
                          <div className="space-y-0.5">
                            <Link href={`/model/${encodeURIComponent(model.id)}`} className="group/link flex items-center gap-1 font-medium text-primary hover:underline">
                              {model.displayName}
                              <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </Link>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {model.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Badge variant="secondary" className="h-5 border-none px-2 py-0 text-[10px] font-medium capitalize">
                          {model.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-right font-bold text-primary">
                        {model.price || '免费'}
                        {model.billingUnit ? <span className="ml-1 text-xs font-medium text-muted-foreground">{model.billingUnit}</span> : null}
                      </TableCell>
                      <TableCell className="py-4 text-right font-medium text-muted-foreground line-through">
                        {model.market_price || 'N/A'}
                        {model.billingUnit ? <span className="ml-1 text-xs">{model.billingUnit}</span> : null}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        {Number.parseInt(discount) > 0 && (
                          <span className="rounded-lg border bg-muted px-2 py-1 text-xs font-bold text-foreground">
                            -
                            {discount}
                            %
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed bg-muted/20 py-20 text-center">
          <p className="text-muted-foreground">未找到匹配的模型。</p>
        </div>
      )}
    </div>
  )
}
