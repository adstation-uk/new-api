'use client'

import type { UserInfo } from '@/lib/user'
import { LayoutDashboard, LogOut, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { logout } from '@/actions/auth-actions'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from '@/i18n/navigation'

type UserMenuProps = {
  user: UserInfo
}

export function UserMenu({ user }: UserMenuProps) {
  const t = useTranslations('Common')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.role >= 10 ? t('status.admin') : t('status.normalUser')}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/console" className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>{t('nav.console')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/console/personal" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('nav.personalSettings')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('action.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
