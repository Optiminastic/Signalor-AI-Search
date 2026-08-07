import type { Projection } from '@/lib/api/projection'
import { BadgeCheck, ListChecks, Swords, TrendingUp } from '@/lib/icons'
import type { LucideIcon } from '@/lib/icons'

export interface Stat {
  icon: LucideIcon
  label: string
  value: string
  sub: string
  /** Render the sub-line in green — a positive, achievable gain. */
  positive?: boolean
}

/**
 * Turn a projection payload into the four headline outcomes the panel shows.
 * Pure and icon-only-by-reference so it unit-tests without a DOM.
 */
export function buildStats(p: Projection): Stat[] {
  const { visibility: vis, recommendation: rec, competitors, prompts } = p
  return [
    {
      icon: TrendingUp,
      label: 'AI visibility',
      value: `Reach ${vis.target}%`,
      sub: vis.delta > 0 ? `+${vis.delta} points from ${vis.current}%` : `Hold at ${vis.current}%`,
      positive: vis.delta > 0,
    },
    {
      icon: Swords,
      label: 'Get ahead',
      value: competitors.to_pass > 0 ? `Overtake ${competitors.to_pass}` : 'Hold your lead',
      sub: competitors.total_ahead > 0 ? `${competitors.total_ahead} ahead today` : 'No one ahead',
      positive: competitors.to_pass > 0,
    },
    {
      icon: ListChecks,
      label: 'Improve prompts',
      value: prompts.to_improve > 0 ? `Strengthen ${prompts.to_improve}` : 'All prompts strong',
      sub: `of ${prompts.total} tracked`,
    },
    {
      icon: BadgeCheck,
      label: 'Recommendation rate',
      value: `${rec.current}% → ${rec.target}%`,
      sub: rec.delta > 0 ? `+${rec.delta} points` : 'Steady',
      positive: rec.delta > 0,
    },
  ]
}
