import { modelConfig } from '@/config/models'
import { ModelIcon } from '@/components/model-icon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  ExternalLink, 
  Search
} from 'lucide-react'
import Link from 'next/link'

function Input({ className, ...props }: any) {
    return (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
                className={`flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} 
                {...props} 
            />
        </div>
    )
}

interface PricingPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams
  const activeTab = (params.tab as string) || 'all'
  const keyword = (params.keyword as string)?.toLowerCase() || ''

  // Process data purely from static config
  const allModels = Object.entries(modelConfig).map(([id, config]) => {
    return {
      id,
      ...config,
      displayName: config.name || id,
      category: config.category || 'chat',
      vendor: config.provider || 'Other'
    }
  })

  const filteredModels = allModels.filter((m: any) => {
    const matchesTab = activeTab === 'all' || m.category === activeTab
    const matchesKeyword = !keyword || 
        m.displayName.toLowerCase().includes(keyword) || 
        m.id.toLowerCase().includes(keyword) ||
        m.vendor.toLowerCase().includes(keyword)
    return matchesTab && matchesKeyword
  })

  // Grouping logic for static models
  const groups: Record<string, any[]> = {}
  filteredModels.forEach((model: any) => {
    const groupName = model.vendor
    if (!groups[groupName]) groups[groupName] = []
    groups[groupName].push(model)
  })

  const tabs = [
    { id: 'all', label: '全部', count: allModels.length },
    { id: 'chat', label: '对话', count: allModels.filter((m: any) => m.category === 'chat').length },
    { id: 'video', label: '视频', count: allModels.filter((m: any) => m.category === 'video').length },
    { id: 'image', label: '绘画', count: allModels.filter((m: any) => m.category === 'image').length },
    { id: 'music', label: '音乐', count: allModels.filter((m: any) => m.category === 'music').length },
  ]

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">定价</h1>
        <p className="text-muted-foreground text-lg">
          精选顶级 AI 模型，手动维护，透明简单。
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
                <Link 
                    key={tab.id}
                    href={tab.id === 'all' ? '/pricing' : `?tab=${tab.id}`}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                        activeTab === tab.id 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-background hover:bg-muted text-muted-foreground border-input'
                    }`}
                >
                    {tab.label} <span className="ml-1 opacity-70 text-[10px]">{tab.count}</span>
                </Link>
            ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <form className="relative flex-1 md:w-80">
                {activeTab !== 'all' && <input type="hidden" name="tab" value={activeTab} />}
                <Input 
                    name="keyword"
                    placeholder="搜索模型、分类或提供商..." 
                    className="bg-background rounded-xl border-slate-200"
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
          <div key={groupName} className="border rounded-2xl bg-card shadow-sm overflow-hidden border-slate-100">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{groupName}</h3>
                <span className="text-blue-500 text-xs font-medium">{groupModels.length} 个模型</span>
              </div>
            </div>
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-[40%] text-xs font-semibold py-4">模型</TableHead>
                  <TableHead className="text-xs font-semibold py-4 text-center">分类</TableHead>
                  <TableHead className="text-xs font-semibold py-4 text-right">我们的价格</TableHead>
                  <TableHead className="text-xs font-semibold py-4 text-right">市场价格</TableHead>
                  <TableHead className="text-xs font-semibold py-4 text-right">折扣</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupModels.map((model: any) => {
                  const ourPrice = parseFloat((model.price || "0").replace('$', ''))
                  const marketPrice = parseFloat((model.market_price || "0").replace('$', ''))
                  const discount = marketPrice > 0 ? ((1 - ourPrice / marketPrice) * 100).toFixed(0) : "0"
                  
                  return (
                    <TableRow key={model.id} className="group hover:bg-slate-50/30 border-slate-100 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-muted rounded-lg">
                            <ModelIcon symbol={model.icon || model.id} className="w-6 h-6" />
                          </div>
                          <div className="space-y-0.5">
                            <Link href={`/model/${encodeURIComponent(model.id)}`} className="text-blue-600 font-medium hover:underline flex items-center gap-1 group/link">
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
                        <Badge variant="secondary" className="px-2 py-0 h-5 bg-slate-100 text-slate-600 border-none font-medium capitalize text-[10px]">
                            {model.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-right font-bold text-blue-600">
                        {model.price || "免费"}
                      </TableCell>
                      <TableCell className="py-4 text-right text-muted-foreground font-medium line-through decoration-slate-300">
                        {model.market_price || "N/A"}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        {parseInt(discount) > 0 && (
                          <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg text-xs border border-green-100">
                              -{discount}%
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
        <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-slate-50">
          <p className="text-muted-foreground">未找到匹配的模型。</p>
        </div>
      )}
    </div>
  )
}
