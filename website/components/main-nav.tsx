'use client'

import type { UserInfo } from '@/lib/user'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

type NavLink = {
  name: string
  href: string
}

type MainNavProps = {
  navLinks: NavLink[]
  user: UserInfo | null
}

export function MainNav({ navLinks, user }: MainNavProps) {
  const pathname = usePathname()
  const t = useTranslations('Common')

  return (
    <nav className="hidden md:flex items-center gap-6">
      {navLinks.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary no-underline',
            pathname === link.href
              ? 'text-foreground'
              : 'text-muted-foreground',
          )}
        >
          {link.name}
        </Link>
      ))}

      {user && (
        <Link
          href="/console"
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary no-underline',
            pathname.startsWith('/console')
              ? 'text-foreground'
              : 'text-muted-foreground',
          )}
        >
          {t('nav.console')}
        </Link>
      )}
    </nav>
  )
}
