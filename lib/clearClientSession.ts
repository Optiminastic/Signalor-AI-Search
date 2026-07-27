import type { QueryClient } from '@tanstack/react-query'

import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useOnboardingWizardStore } from '@/stores/useOnboardingWizardStore'
import { useProjectStore } from '@/stores/useProjectStore'

/**
 * Per-account state that lives outside the Better Auth session cookie. `signOut()`
 * only clears the cookie, so without this these keys survive a logout/delete and
 * bleed into the next account - most visibly, a stale active-org id makes a fresh
 * sign-up resolve a phantom project and get bounced to /onboarding.
 */
const ACCOUNT_LOCAL_KEYS = [
  'signalor.activeProject', // useProjectStore (persist)
  'signalor.activeProjectId', // WorkspaceSwitcher / backlinks active org
  'activeOrgId', // features/site org-store active org
  'signalor.pendingAccountType', // pre-auth Individual/Agency choice
  'signalor.onboarding.dismissed',
  'signalor.onboarding.open',
  'signalor.onboarding.position',
] as const

const ACCOUNT_SESSION_KEYS = [
  'signalor_post_checkout_redirect',
  'signalor_onboarding_draft',
  'signalor_pending_analysis_after_payment',
] as const

function removeKeys(store: Storage, keys: readonly string[]): void {
  for (const key of keys) {
    try {
      store.removeItem(key)
    } catch {
      // storage unavailable (private mode) - degrade silently
    }
  }
}

/**
 * Wipes all client-side session state on logout or account deletion: persisted
 * local/session storage, in-memory Zustand stores, and the (email-keyed) query
 * cache. Call this right after `signOut()`, before navigating away.
 */
export function clearClientSession(queryClient: QueryClient): void {
  if (typeof window !== 'undefined') {
    removeKeys(window.localStorage, ACCOUNT_LOCAL_KEYS)
    removeKeys(window.sessionStorage, ACCOUNT_SESSION_KEYS)
  }

  // Reset in-memory store state so a client-side navigation to sign-up does not
  // read the previous account's values before a full reload clears the singletons.
  useProjectStore.setState({ activeOrgId: null })
  useOnboardingStore.getState().reset()
  useOnboardingWizardStore.getState().reset()

  // Orgs and runs are cached by email; clearing prevents the next account from
  // reading the previous user's data (which drives the onboarding guard).
  queryClient.clear()
}
