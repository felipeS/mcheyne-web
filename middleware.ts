import createMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from '@/lib/i18n';
import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest } from 'next/server';

const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export default async function middleware(request: NextRequest) {
  // Update the Supabase session first
  const supabaseResponse = await updateSession(request);

  // Then handle i18n routing
  const i18nResponse = handleI18nRouting(request);

  // Copy cookies from supabaseResponse to i18nResponse
  // This ensures session refreshing Set-Cookie headers are not lost
  const supabaseCookies = supabaseResponse.headers.getSetCookie();
  supabaseCookies.forEach((cookie) => {
    i18nResponse.headers.append('Set-Cookie', cookie);
  });

  return i18nResponse;
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
