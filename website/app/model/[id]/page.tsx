import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Info, Zap, Shield, Globe, CreditCard, Sparkles, Cpu, Clock } from "lucide-react";
import { ModelIcon } from "@/components/model-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getModelMetadata } from "@/config/models";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: modelParam } = await params;
  const modelId = decodeURIComponent(modelParam);
  const metadata = getModelMetadata(modelId);
  
  return {
    title: `${metadata.name} 定价与详情 | New API`,
    description: `查看 ${metadata.name} 模型的详细定价、规格和能力。提供商: ${metadata.provider}。`,
  };
}

export default async function ModelDetailPage({ params }: Props) {
  const { id: modelParam } = await params;
  const modelId = decodeURIComponent(modelParam);
  
  const metadata = getModelMetadata(modelId);

  // If no manually defined price, we show "N/A" rather than crashing or fetching
  const ourPrice = metadata.price || "价格待询";
  const marketPrice = metadata.market_price || "N/A";

  const calculateDiscount = (currentStr: string, marketStr: string) => {
    const current = parseFloat(currentStr.replace('$', ''));
    const market = parseFloat(marketStr.replace('$', ''));
    if (isNaN(current) || isNaN(market) || market <= 0) return null;
    const discount = Math.round((1 - current / market) * 100);
    return discount > 0 ? `${discount}% 优惠` : null;
  };

  const discount = calculateDiscount(ourPrice, marketPrice);

  return (
    <div className="container py-10 max-w-5xl mx-auto px-4">
      <div className="mb-8">
        <Link 
          href="/pricing" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          返回定价列表
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted rounded-2xl">
              <ModelIcon symbol={metadata.icon || metadata.id} className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{metadata.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">{metadata.provider}</span>
                <Badge variant="outline" className="capitalize">{metadata.category}</Badge>
              </div>
            </div>
          </div>
          
          {discount && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-3 py-1 text-sm border-none">
              <Zap className="w-3 h-3 mr-1 fill-current" />
              最佳性价比: {discount}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" /> 定价概览
              </CardTitle>
              <CardDescription>按百万 (1M) tokens 计费。手工维护价格，仅供参考。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm font-medium text-muted-foreground">提示词 (输入)</p>
                  <p className="text-2xl font-bold">{ourPrice}</p>
                  {marketPrice !== "N/A" && (
                    <p className="text-xs text-muted-foreground line-through decoration-red-400">
                      市场零售价: {marketPrice}
                    </p>
                  )}
                </div>
                <div className="space-y-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm font-medium text-muted-foreground">补全 (输出)</p>
                  <p className="text-2xl font-bold">{ourPrice}</p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-lg border border-blue-100 italic text-sm text-blue-800">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  价格展示已标准化。具体计费倍率以管理后台配置为准。
                  如有疑问，请通过工单与我们联系。
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" /> 高可用保证
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                多渠道动态灾备，确保 API 调用的稳定性与响应速度。
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" /> 边缘分发
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                支持全球低延迟访问，自动选择最优物理链路。
              </CardContent>
            </Card>
          </div>

          {metadata.description && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">模型介绍</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {metadata.description}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="h-2 bg-linear-to-r from-blue-500 to-indigo-500" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" /> 模型规格
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Cpu className="w-3.5 h-3.5" /> 上下文
                </div>
                <span className="font-medium">{metadata.context_window}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Clock className="w-3.5 h-3.5" /> 知识截止
                </div>
                <span className="font-medium">{metadata.knowledge_cutoff}</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">支持能力</p>
                <div className="flex flex-wrap gap-1">
                  {metadata.capabilities?.length ? (
                    metadata.capabilities.map(cap => (
                      <Badge key={cap} variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none px-2 rounded-sm">
                        {cap}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none px-2 rounded-sm">
                      Text Generation
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button size="lg" className="w-full bg-slate-900 text-white rounded-xl font-medium transition-all shadow-lg">
               立即试用
            </Button>
            <Link href="/pricing" className="block">
              <Button variant="outline" size="lg" className="w-full rounded-xl">
                返回定价列表
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
