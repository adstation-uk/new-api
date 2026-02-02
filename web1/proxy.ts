import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Proxy logic: Forward backend requests (/api, /mj, /pg) to the Go backend
  // For standard fetch calls in Client Components or legacy parts.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/mj") ||
    pathname.startsWith("/pg") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/logout")
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "http:";
    url.host = "localhost";
    url.port = "3000";

    // Cookies are automatically forwarded by NextResponse.rewrite for the same domain
    return NextResponse.rewrite(url);
  }

  // 2. Allow everything else to pass through to Next.js
  // Protection is now handled at the page/layout level using getUserInfo()
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
