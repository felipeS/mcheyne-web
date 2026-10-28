import withPWAInit from '@ducanh2912/next-pwa';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const withPWA = withPWAInit({
  dest: 'public',
  register: false,
  // ServiceWorkerUpdater warms the document cache with handled failures. The
  // library's dynamic start-URL helper fires unhandled fetches on history changes.
  cacheStartUrl: false,
  dynamicStartUrl: false,
  cacheOnFrontEndNav: false,
  reloadOnOnline: false,
  fallbacks: { document: '/offline.html' },
  workboxOptions: { skipWaiting: false },
  disable: process.env.NODE_ENV === 'development',
});

// Chrome origin trial token enabling WebMCP on https://www.mcheyne.app. Expires 2027-03-30.
// https://developer.chrome.com/origintrials/#/register_trial/4163014905550602241
const WEBMCP_ORIGIN_TRIAL_TOKEN =
  'AqFkE7uGbo3DojjhxUnamsMWu6pgciEUk0/jSYpaeZheTgqzCu2LByW+Pn7Z4JFf4CbkWS7XBcza54ZXPjvazwIAAABPeyJvcmlnaW4iOiJodHRwczovL3d3dy5tY2hleW5lLmFwcDo0NDMiLCJmZWF0dXJlIjoiV2ViTUNQIiwiZXhwaXJ5IjoxODA2MzY0ODAwfQ==';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Origin-Trial', value: WEBMCP_ORIGIN_TRIAL_TOKEN }],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default withNextIntl(withPWA(nextConfig));
