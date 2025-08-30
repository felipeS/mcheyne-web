import { ReactNode } from "react";
import "../globals.css";
import { ClientProviders } from "@/components/client-providers";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return (
    <html lang={locale}>
      <head>
        <meta name="application-name" content="M'Cheyne Reading Plan" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="M'Cheyne" />
        <meta
          name="description"
          content="Daily Bible reading plan following Robert Murray M'Cheyne's schedule"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />

        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="mask-icon"
          href="/icons/safari-pinned-tab.svg"
          color="#3b82f6"
        />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://your-domain.com" />
        <meta name="twitter:title" content="M'Cheyne Reading Plan" />
        <meta
          name="twitter:description"
          content="Daily Bible reading plan following Robert Murray M'Cheyne's schedule"
        />
        <meta
          name="twitter:image"
          content="https://your-domain.com/icons/icon-192x192.png"
        />
        <meta name="twitter:creator" content="@yourusername" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="M'Cheyne Reading Plan" />
        <meta
          property="og:description"
          content="Daily Bible reading plan following Robert Murray M'Cheyne's schedule"
        />
        <meta property="og:site_name" content="M'Cheyne Reading Plan" />
        <meta property="og:url" content="https://your-domain.com" />
        <meta
          property="og:image"
          content="https://your-domain.com/icons/icon-192x192.png"
        />
      </head>
      <body>
        <ClientProviders locale={locale} messages={messages}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
