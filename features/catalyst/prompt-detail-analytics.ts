import type { Citation, PromptEngineResult, TrackedPrompt } from './prompt-tracker-data'

// Everything a prompt's detail sheet charts is derived here, client-side.
//
// There is no per-prompt history endpoint — but `results[]` is append-only on
// the backend and arrives in chronological order with a `checked_at` per row,
// so every run the prompt has ever had is already on the wire. These helpers
// bucket that array into runs, per-model analytics, and a citation ledger.
// All are pure so a date filter can recompute them over a subset.

/** One check of the prompt across engines — a single recheck cycle. */
export interface PromptRun {
  /** ISO timestamp of the earliest result in the cycle. */
  at: string
  results: PromptEngineResult[]
  /** Share of the cycle's engines that mentioned the brand, 0-100. */
  visibility: number
  /** Engines in the cycle that cited the brand's own domain. */
  citedCount: number
}

/** Rolled-up performance for one engine across every run. */
export interface EngineStats {
  engine: string
  engineLabel: string
  runs: number
  mentioned: number
  cited: number
  /** Share of this engine's runs that mentioned the brand, 0-100. */
  mentionRate: number
  /** Share of this engine's runs that cited the brand's domain, 0-100. */
  citationRate: number
  /** Average rank across runs that reported one; null when never ranked. */
  avgPosition: number | null
  sentiment: { positive: number; neutral: number; negative: number }
  /** Most recent check for this engine, '' when unknown. */
  lastCheckedAt: string
}

/** A cited source, with every engine and run that produced it. */
export interface CitationEntry extends Citation {
  engines: string[]
  /** How many engine answers cited this exact URL. */
  count: number
  /** Most recent time any engine cited it. */
  lastSeenAt: string
}

/** Sources grouped by host, brand-owned first, then competitors. */
export interface CitationGroup {
  domain: string
  isBrand: boolean
  isCompetitor: boolean
  count: number
  entries: CitationEntry[]
}

const RUN_GAP_MS = 10 * 60 * 1000

function time(iso: string): number {
  return iso ? new Date(iso).getTime() : 0
}

function pct(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100)
}

/**
 * Group results into recheck cycles. Every engine is checked in one burst, so
 * results within 10 minutes of each other belong to the same run.
 */
export function buildRuns(results: PromptEngineResult[]): PromptRun[] {
  const dated = results
    .filter(r => r.checkedAt)
    .sort((a, b) => time(a.checkedAt) - time(b.checkedAt))
  const runs: PromptRun[] = []
  let bucket: PromptEngineResult[] = []

  for (const result of dated) {
    const last = bucket.at(-1)
    if (last && time(result.checkedAt) - time(last.checkedAt) > RUN_GAP_MS) {
      runs.push(toRun(bucket))
      bucket = []
    }
    bucket.push(result)
  }
  if (bucket.length > 0) runs.push(toRun(bucket))
  return runs
}

function toRun(results: PromptEngineResult[]): PromptRun {
  return {
    at: results[0]?.checkedAt ?? '',
    results,
    visibility: pct(results.filter(r => r.mentioned).length, results.length),
    citedCount: results.filter(r => r.brandCited).length,
  }
}

function emptyStats(result: PromptEngineResult): EngineStats {
  return {
    engine: result.engine,
    engineLabel: result.engineLabel,
    runs: 0,
    mentioned: 0,
    cited: 0,
    mentionRate: 0,
    citationRate: 0,
    avgPosition: null,
    sentiment: { positive: 0, neutral: 0, negative: 0 },
    lastCheckedAt: '',
  }
}

function tallySentiment(stats: EngineStats, sentiment: string): void {
  if (sentiment === 'positive') stats.sentiment.positive += 1
  else if (sentiment === 'negative') stats.sentiment.negative += 1
  else stats.sentiment.neutral += 1
}

/** Per-engine rollup, ordered by citation rate then mention rate. */
export function buildEngineStats(results: PromptEngineResult[]): EngineStats[] {
  const byEngine = new Map<string, EngineStats>()
  const positions = new Map<string, number[]>()

  for (const result of results) {
    const stats = byEngine.get(result.engine) ?? emptyStats(result)
    stats.runs += 1
    if (result.mentioned) stats.mentioned += 1
    if (result.brandCited) stats.cited += 1
    if (result.position !== null && result.position > 0) {
      positions.set(result.engine, [...(positions.get(result.engine) ?? []), result.position])
    }
    tallySentiment(stats, result.sentiment)
    if (time(result.checkedAt) > time(stats.lastCheckedAt)) stats.lastCheckedAt = result.checkedAt
    byEngine.set(result.engine, stats)
  }

  return [...byEngine.values()]
    .map(stats => {
      const ranks = positions.get(stats.engine) ?? []
      return {
        ...stats,
        mentionRate: pct(stats.mentioned, stats.runs),
        citationRate: pct(stats.cited, stats.runs),
        avgPosition: ranks.length
          ? Math.round((ranks.reduce((a, b) => a + b, 0) / ranks.length) * 10) / 10
          : null,
      }
    })
    .sort((a, b) => b.citationRate - a.citationRate || b.mentionRate - a.mentionRate)
}

function mergeCitation(entry: CitationEntry, citation: Citation, result: PromptEngineResult): void {
  entry.count += 1
  if (!entry.engines.includes(result.engineLabel)) entry.engines.push(result.engineLabel)
  if (time(result.checkedAt) > time(entry.lastSeenAt)) entry.lastSeenAt = result.checkedAt
  // Keep the richest copy of the metadata we have seen for this URL.
  if (!entry.title && citation.title) entry.title = citation.title
  if (!entry.snippet && citation.snippet) entry.snippet = citation.snippet
}

/** Dedupe citations by URL across every engine answer. */
function collectCitations(results: PromptEngineResult[]): Map<string, CitationEntry> {
  const byUrl = new Map<string, CitationEntry>()
  for (const result of results) {
    for (const citation of result.citations) {
      const key = citation.url || `${citation.domain}#${citation.position}`
      const existing = byUrl.get(key)
      if (existing) {
        mergeCitation(existing, citation, result)
        continue
      }
      byUrl.set(key, {
        ...citation,
        engines: [result.engineLabel],
        count: 1,
        lastSeenAt: result.checkedAt,
      })
    }
  }
  return byUrl
}

/** Every source cited across every run, deduped by URL and grouped by domain. */
export function buildCitationGroups(results: PromptEngineResult[]): CitationGroup[] {
  const byDomain = new Map<string, CitationGroup>()
  for (const entry of collectCitations(results).values()) {
    const group = byDomain.get(entry.domain) ?? {
      domain: entry.domain,
      isBrand: entry.isBrand,
      isCompetitor: entry.isCompetitor,
      count: 0,
      entries: [],
    }
    group.count += entry.count
    group.entries.push(entry)
    byDomain.set(entry.domain, group)
  }

  // Your own domain first, then competitors, then everything else by volume.
  return [...byDomain.values()]
    .map(group => ({
      ...group,
      entries: group.entries.sort((a, b) => b.count - a.count || a.position - b.position),
    }))
    .sort(
      (a, b) =>
        Number(b.isBrand) - Number(a.isBrand) ||
        Number(b.isCompetitor) - Number(a.isCompetitor) ||
        b.count - a.count,
    )
}

/** Prompt-level totals recomputed over a (possibly date-filtered) subset. */
export interface PromptTotals {
  runs: number
  visibility: number
  mentions: number
  citedRuns: number
  avgPosition: number | null
}

export function buildTotals(runs: PromptRun[], results: PromptEngineResult[]): PromptTotals {
  const ranked = results.filter(r => r.position !== null && r.position > 0)
  return {
    runs: runs.length,
    visibility: pct(results.filter(r => r.mentioned).length, results.length),
    mentions: results.filter(r => r.mentioned).length,
    citedRuns: runs.filter(r => r.citedCount > 0).length,
    avgPosition: ranked.length
      ? Math.round((ranked.reduce((a, r) => a + (r.position ?? 0), 0) / ranked.length) * 10) / 10
      : null,
  }
}

/** Results kept by a predicate over their `checkedAt` — the date filter hook. */
export function filterResults(
  prompt: TrackedPrompt,
  keep: (timestamp: number) => boolean,
): PromptEngineResult[] {
  return prompt.results.filter(r => !r.checkedAt || keep(time(r.checkedAt)))
}
