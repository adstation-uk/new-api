import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { ModelIcon } from '@/components/model-icon'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { collectionsConfig, getCollectionMetadata, getModelMetadata } from '@/config/models'
import { Link } from '@/i18n/navigation'
import { buildPageMetadata } from '@/lib/seo'

type Props = {
  params: Promise<{ locale: string, key: string }>
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
  const t = await getTranslations('Page.Collections.Detail')
  const { locale, key: rawKey } = await params
  const key = decodeURIComponent(rawKey).toLowerCase()
  const collection = getCollectionMetadata(key)
  const models = toModelListByCollectionKey(key)
  const title = collection?.title || `${key.toUpperCase()} Collections`

  return buildPageMetadata({
    locale,
    pathname: `/collections/${encodeURIComponent(key)}`,
    title,
    description: models.length
      ? t('metaDescriptionWithCount', { key: key.toUpperCase(), count: models.length })
      : t('metaDescription', { key: key.toUpperCase() }),
    keywords: [
      collection?.title || key.toUpperCase(),
      'AI models',
      'model collection',
      'API models',
    ],
  })
}

export default async function CollectionDetailPage({ params }: Props) {
  const t = await getTranslations('Page.Collections.Detail')
  const { key: rawKey } = await params
  const key = decodeURIComponent(rawKey).toLowerCase()
  const collection = getCollectionMetadata(key)
  const models = toModelListByCollectionKey(key)
  const collectionTitle = collection?.title || `${key.toUpperCase()} Models`
  const description = collection?.description || t('description', { title: collectionTitle })

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 space-y-2">
        <p className="text-sm text-muted-foreground">
          {t('explore')}
          {' / '}
          {collectionTitle}
          {' Models'}
        </p>
        <h1 className="text-4xl font-bold tracking-tight">{collectionTitle}</h1>
      </div>

      {models.length === 0
        ? (
            <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
              {t('empty')}
            </div>
          )
        : (
            <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
              <aside className="space-y-4">
                <p className="text-sm leading-7 text-muted-foreground">{description}</p>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{t('overviewTitle')}</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>{t('overview1')}</li>
                    <li>{t('overview2')}</li>
                    <li>{t('overview3')}</li>
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
                          <p className="line-clamp-2 text-xs text-muted-foreground">{model.description || t('modelFallback', { title: collectionTitle, category: model.category })}</p>
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
