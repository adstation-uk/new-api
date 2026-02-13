import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const handleI18nRouting = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Proxy logic: Forward backend requests (/api, /mj, /pg) to the Go backend
  // For standard fetch calls in Client Components or legacy parts.
  if (
    pathname.startsWith('/api')
    || pathname.startsWith('/mj')
    || pathname.startsWith('/pg')
  ) {
    const url = request.nextUrl.clone()
    url.protocol = 'http:'
    url.host = 'localhost'
    url.port = '3000'

    // Cookies are automatically forwarded by NextResponse.rewrite for the same domain
    return NextResponse.rewrite(url)
  }

  // 2. Allow everything else to pass through to Next.js
  // Protection is now handled at the page/layout level using getUserInfo()
  return handleI18nRouting(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
