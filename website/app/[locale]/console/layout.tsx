import type { Metadata } from 'next'
import { ConsoleNavbar } from '@/components/console-navbar'
import { buildPageMetadata } from '@/lib/seo'
import { getUserInfo } from '@/lib/user'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params

  return buildPageMetadata({
    locale,
    pathname: '/console',
    title: locale === 'zh' ? '控制台' : 'Console',
    description: locale === 'zh' ? 'Broadscene 控制台。' : 'Broadscene user console.',
    noIndex: true,
  })
}

export default async function ConsoleLayout({
  children,
  params,
}: Props) {
  const { locale } = await params
  const user = await getUserInfo(1, locale)

  return (
    <div className="min-h-screen">
      {/* Top spacing for fixed global navbar (approx 64px) */}

      {/* Secondary Menu */}
      <ConsoleNavbar user={user} />

      <main className="container mx-auto px-4 md:px-8 py-8">{children}</main>
    </div>
  )
}
