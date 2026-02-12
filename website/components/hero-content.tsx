'use client'

import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

export function HeroTitle() {
  const { t } = useTranslation()

  return (
    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-foreground mb-6">
      {t('home.title')}
    </h1>
  )
}

export function HeroSubtitle() {
  const { t } = useTranslation()

  return (
    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
      {t('home.subtitle')}
    </p>
  )
}
