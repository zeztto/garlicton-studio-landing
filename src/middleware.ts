import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const forwardedHost =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    request.nextUrl.host
  const hostname = forwardedHost.split(':')[0].toLowerCase()

  // Canonicalize the apex domain to www in production.
  if (hostname === 'garlicton.com') {
    const url = request.nextUrl.clone()
    url.protocol = 'https'
    url.hostname = 'www.garlicton.com'
    url.port = ''
    return NextResponse.redirect(url, 301)
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/', '/(ko|en)/:path*'],
}
