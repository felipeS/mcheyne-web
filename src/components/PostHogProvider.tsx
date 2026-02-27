"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect } from "react"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/ingest",
      ui_host: "https://eu.posthog.com",
      defaults: "2025-05-24",
      capture_exceptions: true,
      debug: process.env.NODE_ENV === "development",
      loaded: (ph) => {
        if (
          window.location.hostname.includes("vercel.app") ||
          window.location.hostname.includes("localhost") ||
          window.location.hostname.includes(".local")
        ) {
          ph.opt_out_capturing()
        }

        ph.setPersonProperties({
          language: navigator.language.split("-")[0],
        })
      },
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}