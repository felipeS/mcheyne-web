"use client";

import { NextIntlClientProvider } from "next-intl";
import { ServiceWorkerRegister } from "./service-worker-register";
import { Analytics } from "@vercel/analytics/react";
import { Header } from "./header";

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
      <div className="mx-auto max-w-screen-sm p-4 flex flex-col items-center gap-6">
        <Header />
        {children}
      </div>
      <Analytics />
    </NextIntlClientProvider>
  );
}
