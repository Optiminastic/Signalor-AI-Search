'use client'

import { TrendingUp, Wrench, X, Zap } from 'lucide-react'
import { useEffect } from 'react'

import { useTaskFix, useTaskRec } from '@/features/catalyst/components/autofix/AutoFixContext'
import {
  PRIORITY_STYLE,
  type Priority,
  type Recommendation,
} from '@/features/catalyst/recommendations-data'
import type { RecStep } from '@/lib/api/analyzer'
import { useTaskDetailStore, type OpenTask } from '@/stores/useTaskDetailStore'

/** One modal for the Tasks view: shows the issue, the AI-visibility boost, and —
 * for manual tasks only — the step-by-step fix. Auto-fix tasks hide the steps. */
export function TaskDetailModal(): JSX.Element | null {
  const task = useTaskDetailStore(s => s.task)
  const close = useTaskDetailStore(s => s.close)
  useEscClose(Boolean(task), close)
  if (!task) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--cat-border)] bg-[var(--cat-card)] shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <ModalCard task={task} onClose={close} />
      </div>
    </div>
  )
}

function useEscClose(active: boolean, close: () => void): void {
  useEffect(() => {
    if (!active) return undefined
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, close])
}

function ModalCard({ task, onClose }: { task: OpenTask; onClose: () => void }): JSX.Element {
  const rec = useTaskRec(task.recommendationId)
  // Same platform-aware gate as the task's button: only a true auto-fix hides the
  // steps. If the connected site (e.g. Webflow) can't apply it, show the steps.
  const fix = useTaskFix(task.recommendationId)
  const auto = fix?.auto ?? false
  return (
    <>
      <ModalHeader rec={rec} fallbackTitle={task.name} onClose={onClose} />
      <div className="space-y-5 px-5 pb-5">
        <BoostStat rec={rec} />
        <IssueSection rec={rec} fallback={task.description} />
        <FixSection auto={auto} rec={rec} />
      </div>
    </>
  )
}

function ModalHeader({
  rec,
  fallbackTitle,
  onClose,
}: {
  rec: Recommendation | null
  fallbackTitle: string
  onClose: () => void
}): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-3 p-5">
      <div>
        <HeaderChips pillar={rec?.pillar} priority={rec?.priority} />
        <h2 className="text-[17px] leading-snug font-semibold tracking-tight text-[var(--cat-ink)]">
          {rec?.title || fallbackTitle}
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="shrink-0 rounded-md p-1 text-[var(--cat-ink-3)] hover:bg-[var(--cat-hover)]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function HeaderChips({ pillar, priority }: { pillar?: string; priority?: Priority }): JSX.Element {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      {pillar && (
        <span className="rounded-full bg-[var(--cat-hover)] px-2 py-0.5 text-[11px] font-medium text-[var(--cat-ink-2)]">
          {pillar}
        </span>
      )}
      {priority && (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLE[priority]}`}
        >
          {priority} priority
        </span>
      )}
    </div>
  )
}

function BoostStat({ rec }: { rec: Recommendation | null }): JSX.Element | null {
  const boost = rec?.boostPercent ?? null
  const impactText = rec?.impactEstimate ?? ''
  if (boost === null && !impactText) return null
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--cat-border)] bg-[var(--cat-hover)] px-4 py-3">
      <TrendingUp className="h-5 w-5 shrink-0 text-[#e04a3d]" />
      <div className="min-w-0">
        {boost !== null ? (
          <p className="text-[22px] leading-none font-bold tracking-tight text-[#e04a3d] tabular-nums">
            {boost > 0 ? '+' : ''}
            {boost}%{' '}
            <span className="text-[13px] font-medium text-[var(--cat-ink-2)]">AI visibility</span>
          </p>
        ) : (
          <p className="text-[15px] font-semibold text-[var(--cat-ink)]">
            Estimated impact if fixed
          </p>
        )}
        {impactText && <p className="mt-1 text-[12px] text-[var(--cat-ink-3)]">{impactText}</p>}
      </div>
    </div>
  )
}

function IssueSection({
  rec,
  fallback,
}: {
  rec: Recommendation | null
  fallback: string
}): JSX.Element {
  const issue = rec?.description || fallback || 'No additional detail for this task.'
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        The issue
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed whitespace-pre-line text-[var(--cat-ink-2)]">
        {issue}
      </p>
    </div>
  )
}

function FixSection({ auto, rec }: { auto: boolean; rec: Recommendation | null }): JSX.Element {
  if (auto) return <AutoFixNote />
  return <StepsList steps={rec?.steps ?? []} action={rec?.action ?? ''} />
}

function AutoFixNote(): JSX.Element {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#e04a3d]/20 bg-[#e04a3d]/[0.06] p-4">
      <Zap className="mt-0.5 h-5 w-5 shrink-0 text-[#e04a3d]" />
      <div>
        <p className="text-[13px] font-semibold text-[var(--cat-ink)]">Auto-fix available</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--cat-ink-2)]">
          Signalor’s AI can apply this fix to your connected site automatically — just hit the{' '}
          <span className="font-semibold text-[#e04a3d]">Auto fix</span> button on the task. No
          manual steps needed.
        </p>
      </div>
    </div>
  )
}

function StepItem({ step, index }: { step: RecStep; index: number }): JSX.Element {
  return (
    <li className="flex gap-3">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#e04a3d]/10 text-[12px] font-semibold text-[#e04a3d]">
        {step.n ?? index + 1}
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-[var(--cat-ink)]">{step.title}</p>
        {step.detail && (
          <p className="mt-0.5 text-[12px] leading-relaxed whitespace-pre-line text-[var(--cat-ink-2)]">
            {step.detail}
          </p>
        )}
      </div>
    </li>
  )
}

function StepsList({
  steps,
  action,
}: {
  steps: Recommendation['steps']
  action: string
}): JSX.Element {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <Wrench className="h-4 w-4 text-[var(--cat-ink-2)]" />
        <p className="text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
          How to fix it
        </p>
      </div>
      {steps.length > 0 ? (
        <ol className="mt-3 space-y-3">
          {steps.map((s, i) => (
            <StepItem key={s.n ?? i} step={s} index={i} />
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-[13px] leading-relaxed whitespace-pre-line text-[var(--cat-ink-2)]">
          {action || 'Follow the guidance in your analysis to resolve this manually.'}
        </p>
      )}
    </div>
  )
}
