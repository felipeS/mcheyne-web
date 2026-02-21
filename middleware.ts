import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'es', 'de'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})

export const config = {
  matcher: ['/((?!_next|.*\..*).*)']
}

