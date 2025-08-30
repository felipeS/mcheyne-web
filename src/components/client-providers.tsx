"use client";

import { NextIntlClientProvider } from "next-intl";
import { ServiceWorkerRegister } from "./service-worker-register";
import { Analytics } from "@vercel/analytics/react";

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
      <ServiceWorkerRegister />
      {children}
      <Analytics />
    </NextIntlClientProvider>
  );
}
