'use client'

import { useQuery } from '@tanstack/react-query'

import type { Brand } from '@/features/catalyst/brands-data'
import { getRuns, type RunSummary } from '@/lib/api/analyzer'
import { getOrganizations, type Organization } from '@/lib/api/organizations'
import { useSession } from '@/lib/auth-client'

function domainOf(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '')
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return '—'
  const mins = Math.floor((Date.now() - then) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function pickRun(runs: RunSummary[]): RunSummary | undefined {
  return runs.find(r => r.status === 'complete') ?? runs[0]
}

function toBrand(org: Organization, runs: RunSummary[]): Brand {
  const run = pickRun(runs)
  const score = Math.round(run?.composite_score ?? 0)
  return {
    // The ORG slug, not the run slug: `/dashboard/<slug>` is resolved against
    // `org.slug` by useActiveProject, and an unmatched slug silently falls back
    // to the first brand rather than 404ing.
    slug: org.slug || String(org.id),
    name: org.name,
    url: domainOf(org.url),
    plan: '—',
    geoScore: score,
    visibility: score,
    status: run?.status === 'complete' ? 'active' : 'paused',
    lastRun: run ? formatRelative(run.created_at) : 'No runs',
    members: 1,
  }
}

interface UseBrandsResult {
  data: Brand[] | undefined
  isLoading: boolean
  isError: boolean
}

/** Every organization the user owns, adapted to the brands list (org + latest run). */
export function useBrands(): UseBrandsResult {
  const { data: session } = useSession()
  const email = session?.user?.email ?? undefined

  const query = useQuery({
    queryKey: ['catalyst', 'brands', email ?? ''],
    enabled: Boolean(email),
    queryFn: async (): Promise<Brand[]> => {
      const orgs = await getOrganizations(email as string)
      return Promise.all(
        orgs.map(async org => toBrand(org, await getRuns(email as string, org.id))),
      )
    },
  })
  return { data: query.data, isLoading: query.isLoading, isError: query.isError }
}
