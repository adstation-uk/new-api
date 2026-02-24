import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import { FileText } from 'lucide-react'
import { ModelHeroCard } from '@/components/model/model-hero-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { API_BASE_URL, getModelMetadata } from '@/config/models'

type DocProps = {
  modelId: string
  modelName: string
  baseUrl: string
}

type Props = {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  const contentDir = path.join(process.cwd(), 'content', 'models')
  if (!fs.existsSync(contentDir)) {
    return []
  }

  return fs
    .readdirSync(contentDir)
    .filter(file => file.endsWith('.mdx') && file !== 'default.mdx')
    .map(file => ({ id: file.replace(/\.mdx$/, '') }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: modelParam } = await params
  const modelId = decodeURIComponent(modelParam)
  const metadata = getModelMetadata(modelId)

  return {
    title: `${metadata.name} | New API`,
    description: `Read usage docs and API examples for ${metadata.name}.`,
  }
}

export default async function ModelDetailPage({ params }: Props) {
  const { id: modelParam } = await params
  const modelId = decodeURIComponent(modelParam)
  const metadata = getModelMetadata(modelId)

  let hasDedicatedDoc = false
  let ModelDoc: null | ((props: DocProps) => React.JSX.Element) = null

  try {
    const module = await import(`@/content/models/${modelId}.mdx`)
    ModelDoc = module.default
    hasDedicatedDoc = true
  }
  catch {
    try {
      const module = await import('@/content/models/default.mdx')
      ModelDoc = module.default
    }
    catch {
      ModelDoc = null
    }
  }

  return (
    <>
      <ModelHeroCard
        modelId={modelId}
        modelName={metadata.name || modelId}
        modelCategory={metadata.category}
        modelProvider={metadata.provider}
        modelDescription={metadata.description}
        modelCapabilities={metadata.capabilities}
        price={metadata.price}
        marketPrice={metadata.market_price}
        billingType={metadata.billing_type}
        billingUnit={metadata.billing_unit}
        backHref="/pricing"
      />

      <div className="container mx-auto px-6 py-8 md:py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Model Documentation
            </CardTitle>
            <CardDescription>
              {hasDedicatedDoc
                ? 'This model has dedicated documentation.'
                : 'Using default documentation template for this model.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ModelDoc
              ? (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <ModelDoc
                      modelId={modelId}
                      modelName={metadata.name || modelId}
                      baseUrl={metadata.base_url || API_BASE_URL}
                    />
                  </div>
                )
              : (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    No documentation file found.
                  </div>
                )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
