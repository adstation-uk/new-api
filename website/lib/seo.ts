import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'

export const SITE_NAME = 'Broadscene'

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://newapi.pro'
  return raw.replace(/\/$/, '')
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/')
    return ''

  return pathname.startsWith('/') ? pathname : `/${pathname}`
}

export function getLocaleUrl(locale: string, pathname = '/'): string {
  const path = normalizePath(pathname)
  return `${getSiteUrl()}/${locale}${path}`
}

export function getLanguageAlternates(pathname = '/'): Record<string, string> {
  const path = normalizePath(pathname)
  const locales = routing.locales.reduce<Record<string, string>>((acc, locale) => {
    acc[locale] = `${getSiteUrl()}/${locale}${path}`
    return acc
  }, {})

  return {
    ...locales,
    'x-default': `${getSiteUrl()}/${routing.defaultLocale}${path}`,
  }
}

type BuildMetadataOptions = {
  locale: string
  title: string
  description: string
  pathname?: string
  keywords?: string[]
  noIndex?: boolean
}

export function buildPageMetadata({
  locale,
  title,
  description,
  pathname = '/',
  keywords,
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const canonical = getLocaleUrl(locale, pathname)

  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: getLanguageAlternates(pathname),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
        },
  }
}
