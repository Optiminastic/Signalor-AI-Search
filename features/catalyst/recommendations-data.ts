import type { ChipColor } from '@/components/base/badges/chip'

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

export const PRIORITY_CHIP_COLOR: Record<Priority, ChipColor> = {
  High: 'rose',
  Medium: 'yellow',
  Low: 'neutral',
}
