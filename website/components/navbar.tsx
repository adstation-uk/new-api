import type { UserInfo } from '@/lib/user'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { getOptionalUserInfo } from '@/lib/user'
import { LanguageSwitcher } from './language-switcher'
import { MainNav } from './main-nav'
import { MobileNav } from './mobile-nav'
import { ModeToggle } from './mode-toggle'
import { UserMenu } from './user-menu'

export async function Navbar() {
  const user = await getOptionalUserInfo()
  const t = await getTranslations('Page.Marketing.Navbar')

  const navLinks = [
    { name: t('home'), href: '/' },
    { name: t('pricing'), href: '/pricing' },
    { name: t('models'), href: '/models' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur h-16">
      <div className="container mx-auto flex  h-full items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group no-underline">
            <Image src="/zh/icon.png" alt="Broadscene" width={32} height={32} className="rounded-md" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              Broadscene
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
                        {t('login')}
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/register" className="no-underline px-6">
                        {t('register')}
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
