import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { updateSession } from './lib/supabase/middleware'

const intlMiddleware = createMiddleware(routing)

/**
 * Two applications share this deployment:
 *  - the public NEOMAX marketing site at the root (`/`, `/services`, ...)
 *  - the internal payroll app under a locale prefix (`/dari/dashboard`, ...)
 *
 * Only the locale-prefixed paths go through next-intl and the Supabase session
 * refresh. Marketing routes are public and static, so they skip both — without
 * this, next-intl's `localePrefix: 'always'` would redirect `/` to `/dari`.
 */
function isLocalePrefixed(pathname: string): boolean {
  return routing.locales.some(
    locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Supabase auth callback runs before any locale handling.
  if (pathname.startsWith('/auth/')) {
    return await updateSession(request)
  }

  if (isLocalePrefixed(pathname)) {
    const intlResponse = intlMiddleware(request)
    if (intlResponse) return intlResponse
    return await updateSession(request)
  }

  // Public marketing route.
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)',
  ],
}
