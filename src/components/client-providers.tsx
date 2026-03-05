'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ServiceWorkerUpdater } from './ServiceWorkerUpdater';
import { Analytics } from '@vercel/analytics/react';
import { Header } from './header';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { PostHogProvider } from './PostHogProvider';

function HeaderWithSettings() {
  const { openSettings } = useSettings();
  return <Header onSettingsClick={openSettings} />;
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
          <div className="mx-auto max-w-screen-sm p-4 min-h-[100dvh] flex flex-col items-center gap-8">
            <HeaderWithSettings />
            <main className="w-full flex-1 flex flex-col items-center gap-8">{children}</main>
            <footer className="w-full text-center text-sm text-muted-foreground/60 font-serif pb-4">
              For every look at <i>self</i> — take ten looks at <i>Christ!</i>
            </footer>
          </div>
          <Analytics />
        </SettingsProvider>
      </PostHogProvider>
    </NextIntlClientProvider>
  );
}
