import { ReactNode } from "react";
import type { Metadata } from "next";
import "../globals.css";
import { ClientProviders } from "@/components/client-providers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    title: {
      template: `%s | ${messages.app.title}`,
      default: messages.app.title,
    },
    description: "Daily Bible reading plan following Robert Murray M'Cheyne's schedule",
    applicationName: "M'Cheyne Reading Plan",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "M'Cheyne",
    },
    formatDetection: {
      telephone: false,
    },
    manifest: "/manifest.json",
    themeColor: "#000000",
    twitter: {
      card: "summary",
      title: "M'Cheyne Reading Plan",
      description: "Daily Bible reading plan following Robert Murray M'Cheyne's schedule",
      images: ["https://www.mcheyne.app/icons/icon-192x192.png"],
      creator: "@yourusername",
    },
    openGraph: {
      type: "website",
      title: "M'Cheyne Reading Plan",
      description: "Daily Bible reading plan following Robert Murray M'Cheyne's schedule",
      siteName: "M'Cheyne Reading Plan",
      url: "https://www.mcheyne.app",
      images: [
        {
          url: "https://www.mcheyne.app/icons/icon-192x192.png",
          width: 192,
          height: 192,
        },
      ],
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" }],
      other: [
        { rel: "mask-icon", url: "/icons/safari-pinned-tab.svg", color: "#000000" },
      ],
    },
    other: {
      "msapplication-config": "/browserconfig.xml",
      "msapplication-TileColor": "#000000",
      "msapplication-tap-highlight": "no",
      "mobile-web-app-capable": "yes",
    },
  };
}

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
      <body>
        <ClientProviders locale={locale} messages={messages}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}