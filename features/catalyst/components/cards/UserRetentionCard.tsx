'use client'

import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { Heatmap, type HeatmapCell } from '@/features/catalyst/components/Heatmap'
import { Metric } from '@/features/catalyst/components/Metric'
import { useActiveProject } from '@/hooks/useActiveProject'
import { usePrompts } from '@/hooks/usePrompts'
import { Info } from '@/lib/icons'

export function UserRetentionCard(): JSX.Element {
  const { slug } = useActiveProject()
  const { data } = usePrompts(slug)

  const prompts = data?.prompts ?? []
  // Coverage = per-prompt VISIBILITY (share of runs that mentioned the brand),
  // not p.score — score is 0 for every prompt, which left the heatmap blank.
  const avg = prompts.length
    ? Math.round(prompts.reduce((a, p) => a + p.visibility, 0) / prompts.length)
    : 0
  // Exactly one cell per tracked prompt, each naming the prompt it stands for.
  const cells: HeatmapCell[] = prompts.map(p => ({
    intensity: p.visibility / 100,
    label: `${p.prompt} — ${p.visibility}% visibility`,
  }))

  return (
    <Card>
      <CardHead title="Prompt Coverage" action="Details" />
      <Metric
        value={data ? `${avg}%` : '—'}
        positive
        badge={data ? `${prompts.length} prompts` : '—'}
      />
      <Heatmap cells={cells} />
      {/* The 1-12 axis that used to sit here numbered the twelve columns of the
          old fixed grid. Cells now wrap to the card's width, so column position
          carries no meaning and a scale under them would invent one. */}
      <div className="mt-3.5 flex items-center gap-2 rounded-md bg-[var(--cat-hover)] px-3 py-2.5 text-xs text-[var(--cat-ink-2)]">
        <Info size={14} className="text-[var(--cat-ink-3)]" />
        {prompts.length > 0
          ? 'One square per tracked prompt, shaded by how often engines mention you.'
          : 'Track prompts to see how often engines mention you on each.'}
      </div>
    </Card>
  )
}
