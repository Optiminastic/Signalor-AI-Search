'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

import { getRuns, type RunSummary } from '@/lib/api/analyzer'
import { getOrganizations, type Organization } from '@/lib/api/organizations'
import { useSession } from '@/lib/auth-client'
import { queryKeys } from '@/lib/query-keys'
import { useProjectStore } from '@/stores/useProjectStore'

export interface ActiveProject {
  /** Signed-in user email (auth key for every backend call). */
  email: string | undefined
  /** The user's organizations/projects. */
  projects: Organization[]
  /** Currently selected organization (resolved from the URL slug). */
  activeOrg: Organization | undefined
  /** Latest analysis run for the active org (prefers a completed run). */
  run: RunSummary | undefined
  /** Newest run of ANY status, so an in-flight one is visible. ``run`` above
   *  prefers a completed run, which hides a running analysis whenever the brand
   *  already has results — exactly the case the progress toast has to detect. */
  latestRun: RunSummary | undefined
  /** Run slug — the key for all `runs/s/<slug>/…` data endpoints. */
  slug: string | undefined
  /** Org slug — the stable, unguessable key for `/dashboard/<orgSlug>/…` URLs. */
  orgSlug: string | undefined
  /** True while orgs or runs are still loading. */
  isLoading: boolean
  /** No completed run exists yet for the active org. */
  hasData: boolean
  /** The orgs list fetch has resolved successfully (safe to act on emptiness). */
  orgsResolved: boolean
  /** The active org's runs fetch has resolved successfully. */
  runsResolved: boolean
  select: (orgId: number) => void
}

/** Pick the best run to surface: newest completed, else newest of any status. */
function pickRun(runs: RunSummary[]): RunSummary | undefined {
  if (runs.length === 0) return undefined
  const complete = runs.find(r => r.status === 'complete')
  return complete ?? runs[0]
}

/**
 * Resolves the dashboard's active project end-to-end: URL org slug → org →
 * its latest run slug. The URL is the source of truth (so different brands live
 * at different `/dashboard/<orgSlug>` URLs); the Zustand store is only a fallback
 * for pages without a slug in the path (e.g. the bare `/dashboard` redirect).
 */
export function useActiveProject(): ActiveProject {
  const { data: session } = useSession()
  const email = session?.user?.email ?? undefined
  const params = useParams()
  const urlSlug = typeof params?.slug === 'string' ? params.slug : undefined
  const { activeOrgId, setActiveOrgId } = useProjectStore()

  const orgsQuery = useQuery({
    queryKey: queryKeys.catalyst.orgs(email ?? ''),
    queryFn: () => getOrganizations(email as string),
    enabled: Boolean(email),
  })

  const projects = orgsQuery.data ?? []
  const activeOrg =
    projects.find(p => p.slug === urlSlug) ??
    projects.find(p => p.id === activeOrgId) ??
    projects[0]

  // Keep the store in sync with the URL-resolved brand so the switcher and any
  // slug-less pages default to whatever the user is currently viewing.
  useEffect(() => {
    if (activeOrg && activeOrg.id !== activeOrgId) setActiveOrgId(activeOrg.id)
  }, [activeOrg, activeOrgId, setActiveOrgId])

  const runsQuery = useQuery({
    queryKey: queryKeys.catalyst.runs(activeOrg?.id ?? 0, email ?? ''),
    queryFn: () => getRuns(email as string, activeOrg?.id),
    enabled: Boolean(email && activeOrg),
  })

  const runs = runsQuery.data ?? []
  const run = pickRun(runs)

  return {
    email,
    projects,
    activeOrg,
    run,
    latestRun: runs[0],
    slug: run?.slug,
    orgSlug: activeOrg?.slug,
    isLoading: orgsQuery.isLoading || runsQuery.isLoading,
    hasData: run?.status === 'complete',
    orgsResolved: orgsQuery.isSuccess,
    runsResolved: runsQuery.isSuccess,
    select: setActiveOrgId,
  }
}
