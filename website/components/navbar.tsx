import type { UserInfo } from '@/lib/user'
import { Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from './language-switcher'
import { MainNav } from './main-nav'
import { MobileNav } from './mobile-nav'
import { ModeToggle } from './mode-toggle'
import { UserMenu } from './user-menu'

export async function Navbar({ user }: { user: UserInfo | null }) {
  const navLinks = [
    { name: '首页', href: '/' },
    { name: '价格', href: '/pricing' },
    { name: '模型', href: '/models' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur h-16">
      <div className="container mx-auto flex  h-full items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group no-underline">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              New API
            </span>
          </Link>

          <MainNav navLinks={navLinks} user={user} />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <ModeToggle />
          <LanguageSwitcher />

          <div className="hidden md:flex items-center gap-3">
            {user
              ? (
                  <UserMenu user={user} />
                )
              : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/login" className="no-underline">
                        登录
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/register" className="no-underline px-6">
                        注册
                      </Link>
                    </Button>
                  </>
                )}
          </div>

          <MobileNav navLinks={navLinks} user={user} />
        </div>
      </div>
    </header>
  )
}
