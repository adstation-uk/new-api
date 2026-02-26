'use client'

import { useTranslations } from 'next-intl'

export function HeroTitle() {
  const t = useTranslations('Page.Marketing.Hero')

  return (
    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-foreground mb-6">
      {t('title')}
    </h1>
  )
}

export function HeroSubtitle() {
  const t = useTranslations('Page.Marketing.Hero')

  return (
    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
      {t('subtitle')}
    </p>
  )
}
