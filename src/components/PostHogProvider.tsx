'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

function isLocalLikeHost(hostname: string) {
  return (
    hostname.includes('vercel.app') || hostname.includes('localhost') || hostname.includes('.local')
  );
}

function shouldOptOutLocally(hostname: string) {
  const disableLocalOptOut = process.env.NEXT_PUBLIC_POSTHOG_DISABLE_LOCAL_OPT_OUT === 'true';

  if (disableLocalOptOut) {
    return false;
  }

  return isLocalLikeHost(hostname);
}

export function PostHogProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: '/ingest',
      ui_host: 'https://eu.posthog.com',
      defaults: '2025-05-24',
      capture_exceptions: true,
      debug: process.env.NODE_ENV === 'development',
      loaded: (ph) => {
        const { hostname } = window.location;
        const disableLocalOptOut = process.env.NEXT_PUBLIC_POSTHOG_DISABLE_LOCAL_OPT_OUT === 'true';

        if (shouldOptOutLocally(hostname)) {
          ph.opt_out_capturing();
        } else if (disableLocalOptOut && isLocalLikeHost(hostname)) {
          // Re-enable PostHog if this browser was previously opted out during local development.
          ph.opt_in_capturing();
        }
      },
    });

    if (!localStorage.getItem('first_seen_at')) {
      const now = new Date().toISOString();
      localStorage.setItem('first_seen_at', now);
      posthog.setPersonProperties({ first_seen_at: now });
    }
  }, []);

  useEffect(() => {
    if (posthog) {
      posthog.setPersonProperties({
        language: document.documentElement.lang || locale,
      });
    }
  }, [locale]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
