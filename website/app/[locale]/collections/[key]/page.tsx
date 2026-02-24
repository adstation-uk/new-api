import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { ModelIcon } from '@/components/model-icon'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { collectionsConfig, getCollectionMetadata, getModelMetadata } from '@/config/models'
import { Link } from '@/i18n/navigation'

type Props = {
  params: Promise<{ key: string }>
}

function toModelListByCollectionKey(key: string) {
  const collection = getCollectionMetadata(key)
  if (!collection)
    return []

  return collection.model_ids.map((modelId) => {
    const metadata = getModelMetadata(modelId)
    return {
      id: modelId,
      name: metadata.name || modelId,
      provider: metadata.provider || 'Other',
      category: metadata.category,
      description: metadata.description,
      icon: metadata.icon || modelId,
    }
  })
}

export function generateStaticParams() {
  return Object.keys(collectionsConfig).map(key => ({ key }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key: rawKey } = await params
  const key = decodeURIComponent(rawKey).toLowerCase()
  const collection = getCollectionMetadata(key)
  const models = toModelListByCollectionKey(key)
  const title = `${collection?.title || `${key.toUpperCase()} Collections`} | New API`

  return {
    title,
    description: models.length
      ? `${key.toUpperCase()} 模型集合，共 ${models.length} 个模型。`
      : `${key.toUpperCase()} 模型集合。`,
  }
}

export default async function CollectionDetailPage({ params }: Props) {
  const { key: rawKey } = await params
  const key = decodeURIComponent(rawKey).toLowerCase()
  const collection = getCollectionMetadata(key)
  const models = toModelListByCollectionKey(key)
  const collectionTitle = collection?.title || `${key.toUpperCase()} Models`
  const description = collection?.description || `${collectionTitle}，按能力和场景整理，点击卡片可查看模型详情与调用文档。`

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 space-y-2">
        <p className="text-sm text-muted-foreground">
          探索
          {' / '}
          {collectionTitle}
          {' Models'}
        </p>
        <h1 className="text-4xl font-bold tracking-tight">{collectionTitle}</h1>
      </div>

      {models.length === 0
        ? (
            <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
              当前集合暂无模型。
            </div>
          )
        : (
            <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
              <aside className="space-y-4">
                <p className="text-sm leading-7 text-muted-foreground">{description}</p>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">模型能力概览</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 覆盖多个任务类型与业务场景</li>
                    <li>• 支持统一接口与模型级路由</li>
                    <li>• 可按成本与效果选择对应型号</li>
                  </ul>
                </div>
              </aside>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {models.map(model => (
                  <Link key={model.id} href={`/model/${encodeURIComponent(model.id)}`}>
                    <Card className="h-full overflow-hidden transition-colors hover:bg-muted/30">
                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-start justify-between">
                          <div className="rounded-lg border bg-muted p-2">
                            <ModelIcon symbol={model.icon} className="h-6 w-6" />
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="space-y-2">
                          <h3 className="line-clamp-1 text-base font-semibold">{model.name}</h3>
                          <p className="line-clamp-2 text-xs text-muted-foreground">{model.description || `${collectionTitle} ${model.category} 模型`}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="capitalize">{model.category}</Badge>
                          <span className="text-xs text-muted-foreground">{model.id}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </section>
            </div>
          )}
    </div>
  )
}
