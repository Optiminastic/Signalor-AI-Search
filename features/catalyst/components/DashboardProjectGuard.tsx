'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import { useActiveProject, type ActiveProject } from '@/hooks/useActiveProject'
import { signOut, useSession } from '@/lib/auth-client'
import { Loader2 } from '@/lib/icons'
import { routes } from '@/lib/routes'

function GuardSpinner(): JSX.Element {
  return (
    <div className="grid min-h-svh place-items-center bg-white">
      <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
    </div>
  )
}

interface SessionExpiredProps {
  /** Where to return once they are signed in again. */
  pathname: string
}

/**
 * Shown when the cookie outlived its session. Clearing it is the only way out:
 * while it is set, the middleware bounces every auth route back to /dashboard,
 * and /dashboard lands back here. That clearing happens on an explicit click,
 * never automatically — this component must never be able to end a live session.
 */
function SessionExpired({ pathname }: SessionExpiredProps): JSX.Element {
  const router = useRouter()
  const [working, setWorking] = useState(false)

  const restart = async (): Promise<void> => {
    setWorking(true)
    await signOut().catch(() => undefined)
    router.replace(`${routes.signIn}?callbackUrl=${encodeURIComponent(pathname)}`)
  }

  return (
    <div className="grid min-h-svh place-items-center bg-white px-6">
      <div className="max-w-sm text-center">
        <p className="text-[15px] font-semibold text-neutral-900">Your session has expired</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
          Sign in again to get back to your dashboard.
        </p>
        <button
          type="button"
          onClick={() => void restart()}
          disabled={working}
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md bg-[#e04a3d] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#c93d31] disabled:opacity-60"
        >
          {working && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Sign in
        </button>
      </div>
    </div>
  )
}

/**
 * Confirmed-empty onboarding gate: no project at all, or a *lone* project that
 * has never launched an analysis (zero runs). Only true once the relevant fetch
 * has resolved, so a transient error never redirects a real user.
 */
function needsOnboarding(p: ActiveProject): boolean {
  if (!p.email) return false
  const noProject = p.orgsResolved && p.projects.length === 0
  // The "abandoned the wizard" heuristic only holds for a single-brand user.
  // A user with several brands must NEVER be bounced to onboarding just because
  // the *active* one has no runs yet — they'd loop back here after each analysis
  // whenever the active org resolves to a freshly-created (still-empty) brand.
  const loneUnlaunched =
    p.orgsResolved &&
    p.projects.length === 1 &&
    Boolean(p.activeOrg) &&
    p.runsResolved &&
    p.run === undefined
  return noProject || loneUnlaunched
}

/**
 * Keeps the dashboard behind a real, analyzed project. The dashboard is only
 * meaningful once a brand exists AND its first analysis has run, so both of
 * these send the user back to onboarding:
 *
 *  - No project at all (never started onboarding).
 *  - A project exists but has never launched an analysis (abandoned the wizard
 *    after the URL step, which is what creates the org). Without this, that user
 *    lands on a permanently empty dashboard. Re-entering onboarding is safe: the
 *    backend dedupes the org on a 409, so no duplicate brand is created.
 *
 * A pending or failed run still counts as launched — the dashboard shows their
 * progress. Only redirects on a *confirmed* empty fetch, so a transient backend
 * error never bounces a real user out.
 */
export function DashboardProjectGuard({ children }: { children: ReactNode }): JSX.Element {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending } = useSession()
  const project = useActiveProject()
  const redirect = needsOnboarding(project)
  // Read the session object itself, not a value derived from it. The middleware
  // only checks that a session cookie EXISTS, never that it is still valid, so
  // an expired cookie sails past it and arrives here with nothing behind it.
  const expired = !isPending && session === null

  useEffect(() => {
    if (redirect) router.replace(routes.onboarding)
  }, [redirect, router])

  if (isPending) return <GuardSpinner />
  // Deliberately a visible dead end rather than an automatic recovery. Signing
  // the user out on a *derived* signed-out guess destroyed freshly-created
  // sessions mid-login and bounced them straight back to /sign-in; a transient
  // false positive here only flashes a panel, and only a real click clears the
  // cookie.
  if (expired) return <SessionExpired pathname={pathname} />
  // Hold the dashboard back until we know a launched project exists (or redirect).
  if (project.isLoading || redirect) return <GuardSpinner />
  return <>{children}</>
}
