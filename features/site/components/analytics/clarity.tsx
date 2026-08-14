'use client'

import { useEffect } from 'react'

import { useConsentStore } from '@/features/site/lib/stores/consent-store'
import { env } from '@/lib/env'
import { whenIdle } from '@/lib/when-idle'

const CLARITY_PROJECT_ID = env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? 'wloufvwvwn'

let started = false

/**
 * Microsoft Clarity init, after consent and on an idle callback.
 *
 * The SDK was a top-level `import Clarity from '@microsoft/clarity'` in a
 * component mounted in the root layout, so it shipped in the first-load bundle
 * of every route and was parsed before first paint even when the visitor had
 * declined analytics — consent only gated `init`, never the download.
 */
export function ClarityInit(): null {
  const analytics = useConsentStore(s => s.analytics)
  const hydrated = useConsentStore(s => s.hydrated)

  useEffect(() => {
    if (!hydrated || !analytics || started || !CLARITY_PROJECT_ID) return
    started = true
    void whenIdle(() => {
      import('@microsoft/clarity')
        .then(m => m.default.init(CLARITY_PROJECT_ID))
        .catch(() => undefined)
    })
  }, [hydrated, analytics])

  return null
}
