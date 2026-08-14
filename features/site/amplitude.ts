'use client'

import { useEffect } from 'react'

import { useConsentStore } from '@/features/site/lib/stores/consent-store'
import { whenIdle } from '@/lib/when-idle'

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY ?? ''

/**
 * The SDK, once it has actually been fetched. `null` until then.
 *
 * This module used to `import * as amplitude from '@amplitude/unified'` at the
 * top level, from a component mounted in the ROOT layout. `@amplitude/unified`
 * pulls in rrweb (the session-replay DOM recorder) across 34 packages, so that
 * static import put the whole recorder in the first-load bundle of every route
 * — the marketing pages AND the dashboard — and it downloaded and parsed before
 * first paint whether or not the visitor had consented to anything. Consent
 * gated `initAll`; it never gated the bytes.
 *
 * Loading it dynamically means the recorder is fetched only after consent, and
 * only once the browser is idle, so it can no longer sit on the critical path.
 */
type AmplitudeSdk = typeof import('@amplitude/unified')

let sdk: AmplitudeSdk | null = null
let starting: Promise<void> | null = null

async function loadAndInit(): Promise<void> {
  if (sdk || typeof window === 'undefined') return
  if (!AMPLITUDE_API_KEY) return
  const mod = await import('@amplitude/unified')
  // A second caller may have won the race while this import was in flight.
  if (sdk) return
  sdk = mod
  mod.initAll(AMPLITUDE_API_KEY, {
    analytics: { autocapture: true, logLevel: mod.Types.LogLevel.None },
    sessionReplay: { sampleRate: 1 },
  })
}

function startOnce(): void {
  if (starting) return
  starting = whenIdle(() => loadAndInit().catch(() => undefined))
}

export type UserTraits = Partial<{
  email: string
  first_name: string
  domain: string
  geo_score: number
  fix_count: number
  top_competitor: string
  competitor_list: string
  cms_platform: 'shopify' | 'wordpress' | 'other'
  top_recommendation_title: string
  issue_count: number
  competitor_count: number
}>

/* Both helpers below no-op until the SDK has loaded, which is the same thing
   they already did whenever consent was withheld — the call sites treat
   analytics as fire-and-forget and never read a result. */

export function identifyUser(userId: string, traits: UserTraits): void {
  if (!sdk || !userId) return
  sdk.setUserId(userId)
  const id = new sdk.Identify()
  for (const [k, v] of Object.entries(traits)) {
    if (v !== undefined && v !== null && v !== '') id.set(k, v as never)
  }
  sdk.identify(id)
}

export function track(eventName: string, props?: Record<string, unknown>): void {
  sdk?.track(eventName, props)
}

/**
 * Amplitude init. Fetches and starts the SDK once the user has granted
 * analytics consent, on an idle callback. Renders nothing.
 */
export const Amplitude = (): null => {
  const analytics = useConsentStore(s => s.analytics)
  const hydrated = useConsentStore(s => s.hydrated)

  useEffect(() => {
    if (hydrated && analytics) startOnce()
  }, [hydrated, analytics])

  return null
}
