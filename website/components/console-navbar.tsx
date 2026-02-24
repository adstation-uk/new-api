'use client'

import {
  CreditCard,
  History,
  Key,
  LayoutDashboard,
  Settings,
} from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export function ConsoleNavbar({ user }: { user: any }) {
  const pathname = usePathname()
  void user

  const links = [
    {
      name: '仪表板',
      href: '/console',
      icon: LayoutDashboard,
      active: pathname === '/console',
    },
    {
      name: 'API 密钥',
      href: '/console/token',
      icon: Key,
      active: pathname.startsWith('/console/token'),
    },
    {
      name: '使用日志',
      href: '/console/log',
      icon: History,
      active: pathname.startsWith('/console/log'),
    },
    {
      name: '钱包管理',
      href: '/console/topup',
      icon: CreditCard,
      active: pathname.startsWith('/console/topup'),
    },
    {
      name: '个人设置',
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
