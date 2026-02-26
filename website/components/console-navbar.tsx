'use client'

import {
  CreditCard,
  History,
  Key,
  LayoutDashboard,
  Settings,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export function ConsoleNavbar({ user }: { user: any }) {
  const t = useTranslations('Page.Console.Navbar')
  const pathname = usePathname()
  void user

  const links = [
    {
      name: t('dashboard'),
      href: '/console',
      icon: LayoutDashboard,
      active: pathname === '/console',
    },
    {
      name: t('token'),
      href: '/console/token',
      icon: Key,
      active: pathname.startsWith('/console/token'),
    },
    {
      name: t('log'),
      href: '/console/log',
      icon: History,
      active: pathname.startsWith('/console/log'),
    },
    {
      name: t('topup'),
      href: '/console/topup',
      icon: CreditCard,
      active: pathname.startsWith('/console/topup'),
    },
    {
      name: t('personal'),
      href: '/console/personal',
      icon: Settings,
      active: pathname.startsWith('/console/personal'),
    },
  ]

  return (
    <div className="w-full border-b sticky top-16 z-40 bg-background/60 backdrop-blur">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center h-12 gap-1 overflow-x-auto no-scrollbar">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap bg-transparent',
                link.active
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              <link.icon size={16} />
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
