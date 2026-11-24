import type { RecStep } from '@/lib/api/analyzer'

export type Priority = 'High' | 'Medium' | 'Low'
export type RecStatus = 'open' | 'in-progress' | 'done'

/** UI shape a RecRow renders — adapted from the API by `useRecommendations`. */
export interface Recommendation {
  id: number
  title: string
  pillar: string
  priority: Priority
  impact: number
  effort: string
  status: RecStatus
  /** Either write path can fix this (store OR GitHub) — used for headline counts. */
  auto: boolean
  /** The connected store (Webflow/WordPress/Shopify) can apply this to the live site. */
  canAutoFix: boolean
  /** The GitHub code agent can fix this (Next.js sites) via a PR. */
  codeFixable: boolean
  /** Analyzer finding code — the key the GitHub PR auto-fix needs. */
  findingCode: string
  /** Long explanation of the issue (detail modal). */
  description: string
  /** Free-text remediation guidance (fallback when no structured steps). */
  action: string
  /** One-line "why this matters". */
  why: string
  /** Structured how-to steps (shown for manual fixes). */
  steps: RecStep[]
  /** Raw impact string, e.g. "Could improve your score by ~10 points". */
  impactEstimate: string
  /** "+NN% Visibility" parsed from the title, when present. */
  boostPercent: number | null
}

export const PRIORITY_STYLE: Record<Priority, string> = {
  High: 'bg-[rgba(229,72,77,0.12)] text-[#E5484D]',
  Medium: 'bg-[rgba(246,185,59,0.15)] text-[#F6B93B]',
  Low: 'bg-[var(--cat-hover)] text-[var(--cat-ink-2)]',
}
