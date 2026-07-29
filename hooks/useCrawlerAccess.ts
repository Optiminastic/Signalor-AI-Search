'use client'

import { useQuery } from '@tanstack/react-query'

import {
  getCrawlerAccess,
  type CrawlerAccess,
  type CrawlerAccessEngine,
  type CrawlerAccessStatus,
} from '@/lib/api/crawler'

/**
 * Whether AI engines can crawl the site, and whether they actually do.
 *
 * Grouped by engine rather than user agent, because "ChatGPT cannot see you" is
 * the fact that matters; "OAI-SearchBot is disallowed" is the detail underneath.
 * An engine runs several agents (live search, training, browse) and they can be
 * configured differently, so the worst agent decides the engine's verdict.
 */

/** Worst-first. Order drives both the engine verdict and the display sort. */
const SEVERITY: Record<CrawlerAccessStatus, number> = {
  blocked: 0,
  allowed_never_crawled: 1,
  allowed_stale: 2,
  active: 3,
  unknown: 4,
}

export interface EngineGroup {
  engine: string
  status: CrawlerAccessStatus
  agents: CrawlerAccessEngine[]
  hits: number
  diagnosis: string
}

export interface CrawlerAccessData {
  raw: CrawlerAccess
  groups: EngineGroup[]
  blockedCount: number
  crawlableCount: number
  /** True when robots.txt bars at least one engine — the headline problem. */
  hasBlocked: boolean
  /** True when we have no telemetry, so "never crawled" cannot be claimed. */
  unmeasured: boolean
}

function groupByEngine(raw: CrawlerAccess): EngineGroup[] {
  const byEngine = new Map<string, CrawlerAccessEngine[]>()
  for (const agent of raw.engines) {
    const list = byEngine.get(agent.engine) ?? []
    list.push(agent)
    byEngine.set(agent.engine, list)
  }

  const groups: EngineGroup[] = []
  for (const [engine, agents] of byEngine) {
    // The worst agent decides: being open to training while blocking live
    // search still means the engine cannot cite you.
    const worst = agents.reduce((a, b) => (SEVERITY[a.status] <= SEVERITY[b.status] ? a : b))
    groups.push({
      engine,
      status: worst.status,
      agents,
      hits: agents.reduce((sum, a) => sum + a.hits, 0),
      diagnosis: worst.diagnosis,
    })
  }
  groups.sort((a, b) => SEVERITY[a.status] - SEVERITY[b.status] || a.engine.localeCompare(b.engine))
  return groups
}

function adapt(raw: CrawlerAccess): CrawlerAccessData {
  const groups = groupByEngine(raw)
  return {
    raw,
    groups,
    blockedCount: groups.filter(g => g.status === 'blocked').length,
    crawlableCount: groups.filter(g => g.status === 'active' || g.status === 'allowed_stale')
      .length,
    hasBlocked: groups.some(g => g.status === 'blocked'),
    unmeasured: !raw.has_telemetry,
  }
}

interface UseCrawlerAccessResult {
  data: CrawlerAccessData | undefined
  isLoading: boolean
  isError: boolean
}

/** Per-engine crawlability verdict for the brand's site. */
export function useCrawlerAccess(slug: string | undefined): UseCrawlerAccessResult {
  const query = useQuery({
    queryKey: ['catalyst', 'crawler-access', slug ?? ''],
    enabled: Boolean(slug),
    queryFn: async (): Promise<CrawlerAccessData> => adapt(await getCrawlerAccess(slug as string)),
  })
  return { data: query.data, isLoading: query.isLoading, isError: query.isError }
}
