import { type Instrumentation } from 'next'

export async function register() {
  // No-op for initialization
}

export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: getPostHogServer } = await import('@/lib/posthog')
    const posthog = getPostHogServer()
    let distinctId: string | undefined = undefined

    // Check if headers are available and handle different potential shapes
    // request.headers might be a Headers object (web standard) or a plain object (node)
    // Next.js docs say it's a Request object, so headers is Headers.
    // But let's be defensive.
    const headers = request.headers as any
    let cookieString = ''

    if (headers && typeof headers.get === 'function') {
        cookieString = headers.get('cookie') || ''
    } else if (headers && headers.cookie) {
        cookieString = Array.isArray(headers.cookie) ? headers.cookie.join('; ') : headers.cookie
    }

    if (cookieString) {
      const postHogCookieMatch = cookieString.match(/ph_phc_.*?_posthog=([^;]+)/)
      if (postHogCookieMatch && postHogCookieMatch[1]) {
        try {
          const decodedCookie = decodeURIComponent(postHogCookieMatch[1])
          const postHogData = JSON.parse(decodedCookie)
          distinctId = postHogData.distinct_id
        } catch (e) {
          console.error('Error parsing PostHog cookie:', e)
        }
      }
    }

    // captureExceptionImmediate is async and ensures we wait for the request to complete
    if (posthog) {
        await posthog.captureExceptionImmediate(err, distinctId)
    }
  }
}
