'use client'

import { Github, Globe, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

export function Footer() {
  const t = useTranslations('Page.Marketing.Footer')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t pt-16 pb-8 px-6 overflow-hidden relative">
      <div className="container mx-auto ">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 mb-6 group no-underline"
            >
              <Image src="/zh/icon.png" alt="Broadscene" width={32} height={32} className="rounded-md" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Broadscene
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {t('description')}
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://github.com/nps-z/new-api"
                target="_blank"
                className="p-2 bg-background border rounded-lg text-muted-foreground hover:text-primary transition-colors"
              >
                <Github size={18} />
              </Link>
              <Link
                href="mailto:support@example.com"
                className="p-2 bg-background border rounded-lg text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6">{t('product')}</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  {t('pricing')}
                </Link>
              </li>
              <li>
                <Link
                  href="/models"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  {t('models')}
                </Link>
              </li>
              <li>
                <Link
                  href="https://docs.newapi.pro"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  {t('docs')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6">{t('resource')}</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  {t('login')}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  {t('register')}
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/nps-z/new-api/issues"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  {t('feedback')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6">{t('legal')}</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link
                  href="https://docs.newapi.pro"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  {t('guide')}
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/nps-z/new-api"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  {t('repo')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">
            ©
            {' '}
            {currentYear}
            {' '}
            {t('copyright')}
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Globe size={14} />
              {t('locale')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
