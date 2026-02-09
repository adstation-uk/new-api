'use client'

import { LayoutGrid, List, Search } from 'lucide-react'
import * as React from 'react'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

function BadgeComponent({ children, variant = 'default', className }: any) {
  const variants: any = {
    default: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-muted text-muted-foreground border',
    outline:
      'border border-input bg-background text-muted-foreground font-medium',
    success:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    purple:
      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

type PricingClientProps = {
  initialModels: any[]
  initialGroupRatio: any
  initialStatus: any
}

export function PricingClient({
  initialModels,
  initialGroupRatio,
  initialStatus,
}: PricingClientProps) {
  const [models] = useState<any[]>(initialModels || [])
  const [search, setSearch] = useState('')
  const [groupRatio] = useState<any>(initialGroupRatio || {})
  const [status] = useState<any>(initialStatus || {})
  const [currency, setCurrency] = useState(() => {
    if (initialStatus?.quota_display_type && ['USD', 'CNY', 'CUSTOM'].includes(initialStatus.quota_display_type)) {
      return initialStatus.quota_display_type
    }
    return 'USD'
  })
  const [showWithRecharge, setShowWithRecharge] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState('default')
  const [filterVendor, setFilterVendor] = useState<string[]>([])
  const [filterTag, setFilterTag] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')

  // Copied logic from original file
  const priceRate = status?.price ?? 1
  const usdExchangeRate = status?.usd_exchange_rate ?? priceRate
  const customExchangeRate = status?.custom_currency_exchange_rate ?? 1
  const customCurrencySymbol = status?.custom_currency_symbol ?? '¤'

  const formatPrice = (usdPrice: number) => {
    let priceInUSD = usdPrice
    if (showWithRecharge) {
      priceInUSD = (usdPrice * priceRate) / usdExchangeRate
    }

    if (currency === 'CNY') {
      return `¥${(priceInUSD * usdExchangeRate).toFixed(4)}`
    }
    else if (currency === 'CUSTOM') {
      return `${customCurrencySymbol}${(priceInUSD * customExchangeRate).toFixed(4)}`
    }
    return `$${priceInUSD.toFixed(4)}`
  }

  const getUsedPrice = (model: any) => {
    let usedGroupRatio = groupRatio[selectedGroup]

    if (selectedGroup === 'all' || usedGroupRatio === undefined) {
      let minRatio = Number.POSITIVE_INFINITY
      if (
        Array.isArray(model.enable_groups)
        && model.enable_groups.length > 0
      ) {
        model.enable_groups.forEach((g: string) => {
          const r = groupRatio[g]
          if (r !== undefined && r < minRatio) {
            minRatio = r
            usedGroupRatio = r
          }
        })
      }
      if (
        usedGroupRatio === undefined
        || usedGroupRatio === Number.POSITIVE_INFINITY
      ) {
        usedGroupRatio = 1
      }
    }

    if (model.quota_type === 1) {
      const usdPrice = (model.model_price / 500000) * usedGroupRatio
      return {
        price: formatPrice(usdPrice),
        isPerToken: false,
        usedGroupRatio,
      }
    }
    else {
      const inputPriceUSD = model.model_ratio * 2 * usedGroupRatio
      const outputPriceUSD
        = model.model_ratio * model.completion_ratio * 2 * usedGroupRatio
      return {
        input: formatPrice(inputPriceUSD),
        output: formatPrice(outputPriceUSD),
        isPerToken: true,
        usedGroupRatio,
      }
    }
  }

  const filteredModels = useMemo(() => {
    if (!models)
      return []
    let result = [...models]

    if (search) {
      const term = search.toLowerCase()
      result = result.filter(
        m =>
          m.model_name.toLowerCase().includes(term)
          || (m.tags && m.tags.toLowerCase().includes(term))
          || (m.vendor_name && m.vendor_name.toLowerCase().includes(term)),
      )
    }

    if (filterVendor.length > 0) {
      result = result.filter(m => filterVendor.includes(m.vendor_name))
    }

    if (filterTag.length > 0) {
      result = result.filter((m) => {
        const tags = m.tags?.split(',') || []
        return filterTag.some(t => tags.includes(t.trim()))
      })
    }

    return result.sort((a, b) => {
      if (a.quota_type !== b.quota_type) {
        return a.quota_type - b.quota_type
      }
      const aIsGpt = a.model_name.startsWith('gpt')
      const bIsGpt = b.model_name.startsWith('gpt')
      if (aIsGpt && !bIsGpt)
        return -1
      if (!aIsGpt && bIsGpt)
        return 1
      return a.model_name.localeCompare(b.model_name)
    })
  }, [models, search, filterVendor, filterTag])

  const vendors = useMemo(() => {
    const vSet = new Set<string>()
    models.forEach((m) => {
      if (m.vendor_name)
        vSet.add(m.vendor_name)
    })
    return Array.from(vSet)
  }, [models])

  const tagsList = useMemo(() => {
    const tSet = new Set<string>()
    models.forEach((m) => {
      if (m.tags)
        m.tags.split(',').forEach((t: string) => tSet.add(t.trim()))
    })
    return Array.from(tSet).filter(t => t)
  }, [models])

  return (
    <div className="min-h-screen bg-background pt-10 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-6 shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:overflow-y-auto">
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">
                筛选排序
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">
                  价格分组 (Group)
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedGroup('all')}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-all shadow-sm border',
                      selectedGroup === 'all'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input text-muted-foreground hover:bg-muted',
                    )}
                  >
                    最优分组
                  </button>
                  {Object.keys(groupRatio).map(group => (
                    <button
                      key={group}
                      onClick={() => setSelectedGroup(group)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all shadow-sm border',
                        selectedGroup === group
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-input text-muted-foreground hover:bg-muted',
                      )}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">
                  供应商 (Vendor)
                </label>
                <div className="flex flex-wrap gap-2">
                  {vendors.map(v => (
                    <button
                      key={v}
                      onClick={() =>
                        setFilterVendor(prev =>
                          prev.includes(v)
                            ? prev.filter(x => x !== v)
                            : [...prev, v],
                        )}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all shadow-sm border',
                        filterVendor.includes(v)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-input text-muted-foreground hover:bg-muted',
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">
                  标签 (Tags)
                </label>
                <div className="flex flex-wrap gap-2">
                  {tagsList.map(t => (
                    <button
                      key={t}
                      onClick={() =>
                        setFilterTag(prev =>
                          prev.includes(t)
                            ? prev.filter(x => x !== t)
                            : [...prev, t],
                        )}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all shadow-sm border',
                        filterTag.includes(t)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-input text-muted-foreground hover:bg-muted',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                模型定价费率
              </h1>
              <p className="text-muted-foreground text-sm">
                查看不同模型、不同分组下的费率详情。支持按量和按次计费，一站式调用全球领先
                AI 能力。
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索模型、供应商、标签..."
                  className="pl-9 bg-background shadow-sm h-10 rounded-lg"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-background p-1 rounded-lg border shadow-sm">
                  {['USD', 'CNY'].map(curr => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={cn(
                        'px-4 py-1.5 rounded-md text-xs font-bold transition-all',
                        currency === curr
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      {curr}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowWithRecharge(!showWithRecharge)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 shadow-sm',
                    showWithRecharge
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-input text-muted-foreground hover:bg-muted',
                  )}
                >
                  {showWithRecharge ? '显示折后' : '显示原价'}
                </button>

                <div className="flex bg-background p-1 rounded-lg border shadow-sm ml-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-1.5 rounded-md transition-all',
                      viewMode === 'grid'
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-1.5 rounded-md transition-all',
                      viewMode === 'list'
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'list'
              ? (
                  <Card className="border overflow-hidden rounded-xl shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead className="py-4 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                            模型信息
                          </TableHead>
                          <TableHead className="py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                            计费模式
                          </TableHead>
                          <TableHead className="py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                            Prompt (1M)
                          </TableHead>
                          <TableHead className="py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                            Completion (1M)
                          </TableHead>
                          <TableHead className="py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                            详细参数
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredModels.length > 0
                          ? (
                              filteredModels.map((model) => {
                                const priceData = getUsedPrice(model)
                                return (
                                  <TableRow
                                    key={model.model_name}
                                    className="hover:bg-muted/30 transition-colors border-b group"
                                  >
                                    <TableCell className="py-4 px-6">
                                      <div className="flex flex-col gap-1.5">
                                        <span className="font-bold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors">
                                          {model.model_name}
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                          {model.vendor_name && (
                                            <BadgeComponent
                                              variant="outline"
                                              className="scale-90 origin-left"
                                            >
                                              {model.vendor_name}
                                            </BadgeComponent>
                                          )}
                                          {model.tags?.split(',').map((tag: string) => (
                                            <BadgeComponent
                                              key={tag}
                                              variant="secondary"
                                              className="scale-90 origin-left"
                                            >
                                              {tag.trim()}
                                            </BadgeComponent>
                                          ))}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <BadgeComponent
                                        variant={
                                          model.quota_type === 0 ? 'default' : 'success'
                                        }
                                      >
                                        {model.quota_type === 0
                                          ? 'Tokens'
                                          : 'Flat Rate'}
                                      </BadgeComponent>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm font-semibold">
                                      {priceData.isPerToken
                                        ? priceData.input
                                        : priceData.price}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm font-semibold">
                                      {priceData.isPerToken ? priceData.output : '-'}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex flex-col gap-1 text-[10px] text-muted-foreground font-medium uppercase">
                                        <div className="flex justify-between items-center bg-muted/50 px-2 py-0.5 rounded border">
                                          <span>Ratio:</span>
                                          <span className="text-foreground">
                                            {model.model_ratio}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center bg-muted/50 px-2 py-0.5 rounded border">
                                          <span>Comp:</span>
                                          <span className="text-foreground">
                                            {model.completion_ratio}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                                          <span className="text-primary">Fixed:</span>
                                          <span className="text-primary font-bold">
                                            {priceData.usedGroupRatio}
                                          </span>
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )
                              })
                            )
                          : (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="h-40 text-center text-muted-foreground"
                                >
                                  暂无符合条件的模型
                                </TableCell>
                              </TableRow>
                            )}
                      </TableBody>
                    </Table>
                  </Card>
                )
              : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredModels.length > 0
                      ? (
                          filteredModels.map((model) => {
                            const priceData = getUsedPrice(model)
                            return (
                              <Card
                                key={model.model_name}
                                className="p-5 border hover:shadow-md transition-all group relative overflow-hidden rounded-xl bg-card"
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <div
                                      className="font-bold text-base text-card-foreground group-hover:text-primary transition-colors line-clamp-1 break-all"
                                      title={model.model_name}
                                    >
                                      {model.model_name}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      {model.vendor_name || 'Unknown Vendor'}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-1 mb-6 min-h-[40px] content-start">
                                  {model.tags
                                    ?.split(',')
                                    .slice(0, 5)
                                    .map((tag: string) => (
                                      <BadgeComponent
                                        key={tag}
                                        variant="secondary"
                                        className="scale-90 origin-left"
                                      >
                                        {tag.trim()}
                                      </BadgeComponent>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                  <div className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-lg">
                                    <span className="text-muted-foreground font-medium text-xs">
                                      计费模式
                                    </span>
                                    <BadgeComponent
                                      variant={
                                        model.quota_type === 0 ? 'default' : 'success'
                                      }
                                    >
                                      {model.quota_type === 0 ? '按量' : '按次'}
                                    </BadgeComponent>
                                  </div>

                                  {priceData.isPerToken
                                    ? (
                                        <div className="space-y-2 px-1">
                                          <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground">
                                              提示 (Prompt)
                                            </span>
                                            <span className="font-mono font-bold">
                                              {priceData.input}
                                              {' '}
                                              / 1M
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground">
                                              补全 (Completion)
                                            </span>
                                            <span className="font-mono font-bold">
                                              {priceData.output}
                                              {' '}
                                              / 1M
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    : (
                                        <div className="flex justify-between items-center text-sm px-1">
                                          <span className="text-muted-foreground text-xs">
                                            价格
                                          </span>
                                          <span className="font-mono font-bold">
                                            {priceData.price}
                                            {' '}
                                            / 次
                                          </span>
                                        </div>
                                      )}

                                  <div className="pt-3 border-t border-dashed flex justify-between items-center text-[10px] text-muted-foreground">
                                    <span>
                                      分组倍率:
                                      {priceData.usedGroupRatio}
                                    </span>
                                    <span>
                                      模型倍率:
                                      {model.model_ratio}
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            )
                          })
                        )
                      : (
                          <div className="col-span-full py-20 text-center opacity-50">
                            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                            <span className="text-muted-foreground font-medium">
                              暂无符合条件的模型
                            </span>
                          </div>
                        )}
                  </div>
                )}
          </div>
        </div>
      </div>
    </div>
  )
}
