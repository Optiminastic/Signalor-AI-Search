'use client'

import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

import { useActiveProject, type ActiveProject } from '@/hooks/useActiveProject'
import { useSession } from '@/lib/auth-client'
import { Loader2 } from '@/lib/icons'
import { routes } from '@/lib/routes'

function GuardSpinner(): JSX.Element {
  return (
    <div className="grid min-h-svh place-items-center bg-white">
      <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
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
  const { isPending } = useSession()
  const project = useActiveProject()
  const redirect = needsOnboarding(project)

  useEffect(() => {
    if (redirect) router.replace(routes.onboarding)
  }, [redirect, router])

  // Middleware guards auth; if we somehow have no email, defer to the page.
  if (!project.email) return isPending ? <GuardSpinner /> : <>{children}</>
  // Hold the dashboard back until we know a launched project exists (or redirect).
  if (project.isLoading || redirect) return <GuardSpinner />
  return <>{children}</>
}
