"use client";

import { NextIntlClientProvider } from "next-intl";
import { ServiceWorkerRegister } from "./service-worker-register";
import { Analytics } from "@vercel/analytics/react";
import { Header } from "./header";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import { PostHogProvider } from "./PostHogProvider";
import { Theme } from "@radix-ui/themes";

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
      <PostHogProvider>
        <SettingsProvider>
          <Theme>
            <ServiceWorkerRegister />
            <div className="mx-auto max-w-screen-sm p-4 flex flex-col items-center gap-8">
              <HeaderWithSettings />
              {children}
            </div>
            <Analytics />
          </Theme>
        </SettingsProvider>
      </PostHogProvider>
    </NextIntlClientProvider>
  );
}