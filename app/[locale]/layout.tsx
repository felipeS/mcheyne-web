import {ReactNode} from 'react'
import '../globals.css'
import {ClientProviders} from '@/components/client-providers'

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = (await import(`../../messages/${locale}.json`)).default
  return (
    <html lang={locale}>
      <body>
        <ClientProviders locale={locale} messages={messages}>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}

