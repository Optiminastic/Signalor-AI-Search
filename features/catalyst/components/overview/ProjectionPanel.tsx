'use client'

import { TransitionLink } from '@/components/TransitionLink'
import { buildStats, type Stat } from '@/features/catalyst/projection-stats'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useProjection } from '@/hooks/useProjection'
import { Sparkles } from '@/lib/icons'

const GREEN = '#2FBE7E'

function MetricStat({ stat }: { stat: Stat }): JSX.Element {
  const Icon = stat.icon
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--cat-border)] bg-[var(--cat-card)] p-3">
      <div className="flex items-center gap-1.5 text-[var(--cat-ink-3)]">
        <Icon size={14} />
        <span className="text-[11px] font-medium tracking-wide uppercase">{stat.label}</span>
      </div>
      <p className="text-[15px] leading-tight font-semibold text-[var(--cat-ink)]">{stat.value}</p>
      <p
        className="text-[12px]"
        style={stat.positive ? { color: GREEN, fontWeight: 500 } : { color: 'var(--cat-ink-3)' }}
      >
        {stat.sub}
      </p>
    </div>
  )
}

function ProjectionHeader({ tasksHref }: { tasksHref: string }): JSX.Element {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[rgba(224,74,61,0.1)] text-[#e04a3d] ring-1 ring-[rgba(224,74,61,0.16)] ring-inset">
        <Sparkles size={14} strokeWidth={2.2} />
      </span>
      <p className="min-w-0 truncate text-[13px] text-[var(--cat-ink-2)]">
        <span className="font-semibold text-[var(--cat-ink)]">Your next 30 days</span>
        <span className="mx-2 text-[var(--cat-ink-3)]">·</span>
        What Signalor can help you achieve.
        <TransitionLink
          href={tasksHref}
          className="ml-2 font-medium text-[#e04a3d] underline decoration-[rgba(224,74,61,0.35)] underline-offset-2 transition-colors hover:decoration-[#e04a3d]"
        >
          Start now
        </TransitionLink>
      </p>
    </div>
  )
}

/**
 * Dashboard "Your next 30 days" — a forward-looking projection of what Signalor
 * can help the brand achieve: a higher AI-visibility target, competitors it can
 * overtake, prompts to strengthen, and a lifted recommendation rate. Replaces the
 * backward-looking "Priority Actions" panel. Hidden until a completed analysis
 * run exists (no run ⇒ nothing to project from).
 */
export function ProjectionPanel(): JSX.Element | null {
  const { projection, isLoading, noRun } = useProjection()
  const brandPath = useBrandPath()

  if (noRun || isLoading || !projection) return null

  return (
    // rounded-2xl to match the cards below it. At rounded-md this band was the
    // only 8px corner on a page of 16px ones, so it read as a leftover from the
    // previous design language rather than part of the same surface family.
    <section className="col-span-full rounded-2xl border border-[rgba(224,74,61,0.16)] bg-[rgba(224,74,61,0.04)] p-3">
      <ProjectionHeader tasksHref={brandPath('tasks')} />
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {buildStats(projection).map(stat => (
          <MetricStat key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  )
}
