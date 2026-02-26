import type { MetadataRoute } from 'next'
import { collectionsConfig, modelConfig } from '@/config/models'
import { routing } from '@/i18n/routing'
import { getLocaleUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const staticPages = ['/', '/models', '/pricing']

  const staticEntries = routing.locales.flatMap(locale =>
    staticPages.map(pathname => ({
      url: getLocaleUrl(locale, pathname),
      lastModified: now,
      changeFrequency: pathname === '/' ? 'daily' as const : 'weekly' as const,
      priority: pathname === '/' ? 1 : 0.8,
    })),
  )

  const modelEntries = routing.locales.flatMap(locale =>
    Object.keys(modelConfig).map(modelId => ({
      url: getLocaleUrl(locale, `/model/${encodeURIComponent(modelId)}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  )

  const collectionEntries = routing.locales.flatMap(locale =>
    Object.keys(collectionsConfig).map(key => ({
      url: getLocaleUrl(locale, `/collections/${encodeURIComponent(key)}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  )

  return [...staticEntries, ...modelEntries, ...collectionEntries]
}
