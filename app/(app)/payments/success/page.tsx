'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { CheckCircle2, Loader2 } from '@/features/site/components/icons'
import { startAnalysis } from '@/features/site/lib/api/analyzer'
import { verifyCheckout } from '@/features/site/lib/api/payments'
import { useSession } from '@/features/site/lib/auth-client'
import { routes } from '@/features/site/lib/config'
import {
  ONBOARDING_DRAFT_KEY,
  POST_CHECKOUT_REDIRECT_KEY,
  clearPendingAnalysisAfterPayment,
  readPendingAnalysisAfterPayment,
  safeInternalReturnPath,
} from '@/features/site/lib/internal-nav'
import { useProjectStore } from '@/stores/useProjectStore'

/** Read and remove post-checkout redirect (same as before, exported for reuse). */
function consumePostCheckoutPath(): string {
  try {
    const raw = sessionStorage.getItem(POST_CHECKOUT_REDIRECT_KEY)
    const safe = safeInternalReturnPath(raw)
    sessionStorage.removeItem(POST_CHECKOUT_REDIRECT_KEY)
    return safe || routes.dashboard
  } catch {
    return routes.dashboard
  }
}

/** Read the redirect WITHOUT removing it — background polling may still need
 *  to consume it later when confirmation finally lands. */
function peekPostCheckoutPath(): string {
  try {
    return (
      safeInternalReturnPath(sessionStorage.getItem(POST_CHECKOUT_REDIRECT_KEY)) || routes.dashboard
    )
  } catch {
    return routes.dashboard
  }
}

export default function PaymentSuccessPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [message, setMessage] = useState('Confirming your payment...')
  const [showSuccessIcon, setShowSuccessIcon] = useState(false)
  // After ~40s of unconfirmed polling, stop pretending it's instant: show an
  // explicit "taking longer than usual" screen with a way forward, while
  // polling continues in the background.
  const [slow, setSlow] = useState(false)
  const [slowNext, setSlowNext] = useState<string>(routes.dashboard)
  const startedRef = useRef(false)

  // Polling is keyed on email (a stable string), not the whole session
  // object. better-auth's useSession returns a fresh `session` reference on
  // every render; depending on `session` directly would tear down the
  // setInterval and the startedRef guard would silently prevent restart —
  // so polling would die after the first re-render and the user would
  // never see is_active flip to true.
  const userEmail = session?.user?.email
  useEffect(() => {
    if (!userEmail) return
    if (startedRef.current) return
    startedRef.current = true

    let cancelled = false
    let attempts = 0

    // Dodo appends subscription_id (and status) to the return_url. Passing it
    // to verify-checkout lets the backend reconcile against Dodo's API
    // directly, so confirmation does NOT depend on the webhook having arrived
    // — that dependency is what used to leave this page spinning forever.
    let dodoSubscriptionId = ''
    try {
      dodoSubscriptionId = new URLSearchParams(window.location.search).get('subscription_id') ?? ''
    } catch {
      /* ignore */
    }

    let busy = false
    let slowShown = false
    const showSlowScreen = () => {
      if (cancelled || slowShown) return
      slowShown = true
      // Keep polling silently, but stop the "any second now" spinner —
      // silently bouncing to a paywalled app confused people more than
      // the wait itself.
      setShowSuccessIcon(false)
      setSlowNext(peekPostCheckoutPath())
      setSlow(true)
    }
    const poll = setInterval(async () => {
      if (cancelled || busy) return
      busy = true
      attempts += 1

      try {
        const status = await verifyCheckout(userEmail, dodoSubscriptionId)
        if (!status.is_active) {
          if (attempts >= 20) showSlowScreen()
          if (attempts > 150) {
            clearInterval(poll)
          }
          return
        }

        clearInterval(poll)
        setSlow(false)

        const pending = readPendingAnalysisAfterPayment()
        const emailMatch = pending && pending.email.toLowerCase() === userEmail.toLowerCase()

        if (pending && !emailMatch) {
          clearPendingAnalysisAfterPayment()
        }

        if (emailMatch && pending) {
          setMessage('Starting your GEO analysis...')
          setShowSuccessIcon(false)
          try {
            await startAnalysis({
              url: pending.url,
              run_type: pending.run_type,
              email: pending.email,
              brand_name: pending.brand_name,
              org_id: pending.org_id,
              ...(pending.v === 2
                ? {
                    verify_org_workspace: true,
                    prompts: pending.prompts,
                  }
                : {}),
            })
            if (cancelled) return
            clearPendingAnalysisAfterPayment()
            try {
              sessionStorage.removeItem(POST_CHECKOUT_REDIRECT_KEY)
              sessionStorage.removeItem(ONBOARDING_DRAFT_KEY)
            } catch {
              /* ignore */
            }
            // Make the just-onboarded brand the active project, then hand off
            // to the analysing screen (it polls this run by email and lands on
            // the dashboard when the first analysis completes). Run slug is
            // not needed by /loading, but the active org decides WHICH brand
            // the dashboard opens afterwards.
            useProjectStore.getState().setActiveOrgId(pending.org_id)
            router.replace(routes.loading)
          } catch {
            if (cancelled) return
            setMessage('Payment received. Continue setup to run analysis.')
            router.replace(consumePostCheckoutPath())
          }
          return
        }

        setShowSuccessIcon(true)
        setMessage('Redirecting...')
        const next = consumePostCheckoutPath()
        setTimeout(() => {
          if (!cancelled) router.replace(next)
        }, 1500)
      } catch {
        // Transient API error — same slow-path UX as "not active yet";
        // keep polling instead of silently dumping the user on the dashboard.
        if (attempts >= 20) showSlowScreen()
        if (attempts > 150) {
          clearInterval(poll)
        }
      } finally {
        busy = false
      }
    }, 2000)

    return () => {
      cancelled = true
      clearInterval(poll)
    }
  }, [userEmail, router])

  if (isPending) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground mt-4 text-sm">Loading your session…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="bg-background mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
        <p className="text-muted-foreground text-sm">
          If you completed payment, sign in with the <strong>same email</strong> you used at
          checkout so we can confirm your subscription and continue.
        </p>
        <Link
          href={routes.signIn}
          className="bg-primary text-primary-foreground mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Sign in
        </Link>
      </div>
    )
  }

  if (slow) {
    return (
      <div className="bg-background mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <h1 className="text-foreground mt-4 text-lg font-bold">
          Confirming your payment is taking longer than usual
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Your payment went through — the confirmation from our payment provider is still on its
          way. We keep checking in the background, and your account activates automatically the
          moment it lands. You can also continue now and pick up where you left off.
        </p>
        <Link
          href={slowNext}
          className="bg-primary text-primary-foreground mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Continue setup
        </Link>
        <p className="text-muted-foreground mt-3 text-xs">
          Still locked out after a few minutes? Contact support with the email you paid with.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 text-center">
      {!showSuccessIcon ? (
        <>
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-4 text-sm">{message}</p>
        </>
      ) : (
        <>
          <CheckCircle2 className="text-primary h-12 w-12" />
          <h1 className="mt-4 text-xl font-bold text-white md:text-2xl">Payment Successful!</h1>
          <p className="text-muted-foreground mt-2 text-sm">{message}</p>
        </>
      )}
    </div>
  )
}
