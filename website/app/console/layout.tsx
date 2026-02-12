import { ConsoleNavbar } from '@/components/console-navbar'
import { getUserInfo } from '@/lib/user'

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserInfo()

  return (
    <div className="min-h-screen">
      {/* Top spacing for fixed global navbar (approx 64px) */}

      {/* Secondary Menu */}
      <ConsoleNavbar user={user} />

      <main className="container mx-auto px-4 md:px-8 py-8">{children}</main>
    </div>
  )
}
