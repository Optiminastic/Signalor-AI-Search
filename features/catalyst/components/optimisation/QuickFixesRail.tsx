'use client'

import { TaskFixResultCard } from '@/features/catalyst/components/tasks/detail/TaskFixResultCard'
import type { Recommendation } from '@/features/catalyst/recommendations-data'
import { useRecommendations } from '@/hooks/useRecommendations'
import { useAutoFixFlow, type AutoFixFlow } from '@/hooks/useTaskAutoFix'
import { Check, Loader2, X, Zap } from '@/lib/icons'

interface QuickFixesRailProps {
  slug: string
  onClose: () => void
}

function recKey(rec: Recommendation): string {
  return `rec-${rec.id}`
}

function FixButton({ rec, flow }: { rec: Recommendation; flow: AutoFixFlow }): JSX.Element {
  const active = flow.activeKey === recKey(rec)
  if (active && flow.phase === 'working') {
    return (
      <span className="text-muted-foreground inline-flex h-7 shrink-0 items-center gap-1 text-[11px] font-medium">
        <Loader2 className="size-3 animate-spin" /> Fixing…
      </span>
    )
  }
  if (active && (flow.phase === 'done' || flow.phase === 'manual')) {
    return (
      <span className="text-success inline-flex h-7 shrink-0 items-center gap-1 text-[11px] font-semibold">
        <Check className="size-3" /> {flow.phase === 'manual' ? 'See below' : 'Done'}
      </span>
    )
  }
  return (
    <button
      type="button"
      onClick={() =>
        flow.start({ key: recKey(rec), recommendationId: rec.id, findingCode: rec.findingCode })
      }
      className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
      style={{ background: '#e04a3d' }}
    >
      <Zap className="size-3" />
      {active && flow.phase === 'failed' ? 'Retry' : 'Fix'}
    </button>
  )
}

function FixRow({ rec, flow }: { rec: Recommendation; flow: AutoFixFlow }): JSX.Element {
  const active = flow.activeKey === recKey(rec)
  return (
    <div className={`flex flex-col gap-2 px-3 py-2.5 ${active ? 'bg-muted/30' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-foreground truncate text-[12.5px] font-medium">{rec.title}</p>
          <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-[10.5px]">
            <span>{rec.pillar}</span>
            <span>· {rec.effort}</span>
          </p>
        </div>
        <FixButton rec={rec} flow={flow} />
      </div>
      {active && <TaskFixResultCard fix={flow} />}
    </div>
  )
}

/** Right rail on the Content page: auto-fixable recommendations, fixed in
 * place with the same toast narration + PR/CMS proof as the task page. */
export function QuickFixesRail({ slug, onClose }: QuickFixesRailProps): JSX.Element {
  const { data } = useRecommendations(slug)
  const flow = useAutoFixFlow()
  const fixable = data?.recommendations.filter(r => r.auto) ?? []

  return (
    <div className="bg-background flex w-[380px] min-w-[320px] shrink-0 flex-col overflow-y-auto">
      <div className="border-border flex items-center justify-between border-b px-3 py-2">
        <p className="text-foreground text-xs font-semibold">
          Quick fixes
          <span className="text-muted-foreground ml-1.5 font-normal">
            {fixable.length} auto-fixable
          </span>
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-md p-1"
          aria-label="Close"
        >
          <X className="size-3.5" />
        </button>
      </div>
      {fixable.length === 0 ? (
        <p className="text-muted-foreground px-3 py-4 text-[12px]">
          Nothing auto-fixable right now. New fixes appear after each analysis.
        </p>
      ) : (
        <div className="divide-border/60 divide-y">
          {fixable.map(rec => (
            <FixRow key={rec.id} rec={rec} flow={flow} />
          ))}
        </div>
      )}
    </div>
  )
}
