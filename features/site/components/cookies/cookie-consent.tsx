'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import { hasDecidedConsent, useConsentStore } from '@/features/site/lib/stores/consent-store'

/**
 * Small cookie-consent popover pinned to the bottom-left corner. Renders on
 * first visit only (no stored decision). Two choices: Accept all / Reject all.
 *
 * Mount once in the root layout. Tracker components (Amplitude, Clarity, GA)
 * check `useConsentStore(s => s.analytics)` before initializing — they stay
 * dormant until the user accepts.
 */
export function CookieConsentBanner() {
  const hydrated = useConsentStore(s => s.hydrated)
  const necessary = useConsentStore(s => s.necessary)
  const analytics = useConsentStore(s => s.analytics)
  const marketing = useConsentStore(s => s.marketing)
  const decidedAt = useConsentStore(s => s.decidedAt)
  const hydrate = useConsentStore(s => s.hydrate)
  const acceptAll = useConsentStore(s => s.acceptAll)
  const rejectAll = useConsentStore(s => s.rejectAll)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Render nothing until we've read localStorage so we don't flash the banner
  // for users who've already decided.
  if (!hydrated) return null
  if (hasDecidedConsent({ necessary, analytics, marketing, decidedAt })) return null

  return (
    <div
      className="bg-card ring-border fixed right-4 bottom-4 left-4 z-50 rounded-xl p-4 shadow-md ring-1 shadow-black/5 sm:right-auto sm:w-[340px]"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <p className="text-foreground text-[13px] font-semibold">We use cookies</p>
      <p className="text-muted-foreground mt-1 text-[13px] leading-relaxed">
        Cookies keep the app working and, with your permission, help us understand how it is used.
        See our{' '}
        <Link
          href="/policy"
          className="text-primary-ink font-medium underline underline-offset-2 hover:opacity-80"
        >
          Privacy policy
        </Link>
        .
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={rejectAll}
          className="bg-card text-foreground ring-border hover:bg-muted inline-flex h-8 flex-1 items-center justify-center rounded-md px-4 text-[13px] font-medium ring-1 transition-colors"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={acceptAll}
          className="bg-primary-strong text-primary-foreground inline-flex h-8 flex-1 items-center justify-center rounded-md px-4 text-[13px] font-semibold shadow-sm transition-opacity hover:opacity-90"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
