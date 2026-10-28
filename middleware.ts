import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, locales, type Locale } from '@/lib/i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export default function middleware(request: NextRequest) {
  // Links and the sitemap use explicit /en/... URLs, so serve prefixed paths as-is rather than
  // letting as-needed redirect them to the unprefixed URL.
  const firstSegment = request.nextUrl.pathname.split('/')[1];
  if (locales.includes(firstSegment as Locale)) return NextResponse.next();
  return intlMiddleware(request);
}

export const config = {
  // Skip Next internals, Vercel analytics, the PostHog proxy and anything with a file extension.
  matcher: ['/((?!_next|_vercel|ingest|.*\\..*).*)'],
};
