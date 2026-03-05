'use client';

import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { ServiceWorkerUpdater } from './ServiceWorkerUpdater';
import { Analytics } from '@vercel/analytics/react';
import { Header } from './header';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { PostHogProvider } from './PostHogProvider';

function HeaderWithSettings() {
  const { openSettings } = useSettings();
  return <Header onSettingsClick={openSettings} />;
}

function FooterQuote() {
  const t = useTranslations('app');
  return (
    <footer className="w-full text-center text-sm text-muted-foreground/60 font-serif pb-4">
      {t.rich('quote', {
        italic: (chunks) => <i>{chunks}</i>,
      })}
    </footer>
  );
}

export function ClientProviders({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <PostHogProvider locale={locale}>
        <SettingsProvider>
          <ServiceWorkerUpdater />
          <div className="mx-auto max-w-screen-sm p-4 min-h-screen flex flex-col items-center gap-8">
            <HeaderWithSettings />
            <main className="w-full flex-1 flex flex-col items-center gap-8">{children}</main>
            <FooterQuote />
          </div>
          <Analytics />
        </SettingsProvider>
      </PostHogProvider>
    </NextIntlClientProvider>
  );
}
