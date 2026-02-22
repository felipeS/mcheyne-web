"use client"

import posthog from "posthog-js"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    posthog.captureException(error)
  }, [error])

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  )
}
