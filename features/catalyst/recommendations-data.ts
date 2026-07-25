export type Priority = 'High' | 'Medium' | 'Low'
export type RecStatus = 'open' | 'in-progress' | 'done'

/** UI shape a RecRow renders — adapted from the API by `useRecommendations`. */
export interface Recommendation {
  id: number
  title: string
  pillar: string
  priority: Priority
  effort: string
  status: RecStatus
  auto: boolean
  /** Analyzer finding code — the key the GitHub PR auto-fix needs. */
  findingCode: string
}

export const PRIORITY_STYLE: Record<Priority, string> = {
  High: 'bg-[rgba(229,72,77,0.12)] text-[#E5484D]',
  Medium: 'bg-[rgba(246,185,59,0.15)] text-[#F6B93B]',
  Low: 'bg-[var(--cat-hover)] text-[var(--cat-ink-2)]',
}
