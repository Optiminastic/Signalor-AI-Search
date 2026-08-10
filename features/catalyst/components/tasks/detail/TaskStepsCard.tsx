'use client'

import { useEffect, useState } from 'react'

import type { TaskStep } from '@/hooks/useTaskDetail'
import { Check } from '@/lib/icons'

/** Per-task storage key; survives navigation and reloads on this browser. */
function storageKey(taskId: number): string {
  return `signalor:task-steps:${taskId}`
}

function readDone(taskId: number): number[] {
  try {
    const raw = window.localStorage.getItem(storageKey(taskId))
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : []
  } catch {
    return []
  }
}

/**
 * Which steps the user has ticked off, persisted locally.
 *
 * Local rather than server state on purpose: a step checkbox is a personal
 * working note ("where was I?"), not task truth — the task's real completion
 * stays the Mark complete / Verify flow, which re-crawls the live site.
 * Restored in an effect, not a lazy initializer, because the page is
 * server-rendered and reading localStorage up front would trip hydration.
 */
function useStepChecklist(taskId: number): [Set<number>, (n: number) => void] {
  const [done, setDone] = useState<Set<number>>(new Set())

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see docblock
    setDone(new Set(readDone(taskId)))
  }, [taskId])

  const toggle = (n: number): void => {
    setDone(prev => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      window.localStorage.setItem(storageKey(taskId), JSON.stringify([...next]))
      return next
    })
  }
  return [done, toggle]
}

interface StepRowProps {
  step: TaskStep
  n: number
  isDone: boolean
  onToggle: () => void
}

/** The tick control: the step number that becomes a green check when done. */
function StepToggle({ n, isDone, onToggle }: Omit<StepRowProps, 'step'>): JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isDone}
      aria-label={`Mark step ${n} ${isDone ? 'not done' : 'done'}`}
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold tabular-nums transition-colors ${
        isDone
          ? 'border-[#2FBE7E] bg-[rgba(47,190,126,0.14)] text-[#2FBE7E]'
          : 'border-[var(--cat-border)] bg-[var(--cat-hover)] text-[var(--cat-ink-2)] group-hover:border-[var(--cat-ink-3)]'
      }`}
    >
      {isDone ? <Check size={13} strokeWidth={2.6} /> : n}
    </button>
  )
}

function StepRow({ step, n, isDone, onToggle }: StepRowProps): JSX.Element {
  return (
    <li className="group flex gap-3">
      <div className="flex flex-col items-center">
        <StepToggle n={n} isDone={isDone} onToggle={onToggle} />
        {/* Connector line to the next step; the list hides it on the last row. */}
        <span className="mt-1 w-px flex-1 bg-[var(--cat-border-soft)] group-last:hidden" />
      </div>
      <div className="min-w-0 flex-1 pb-4 group-last:pb-0">
        <p
          className={`text-[13px] font-semibold transition-colors ${
            isDone ? 'text-[var(--cat-ink-3)] line-through' : 'text-[var(--cat-ink)]'
          }`}
        >
          {step.title}
        </p>
        {step.detail && (
          <p
            className={`mt-0.5 text-[13px] leading-relaxed whitespace-pre-line ${
              isDone ? 'text-[var(--cat-ink-3)]' : 'text-[var(--cat-ink-2)]'
            }`}
          >
            {step.detail}
          </p>
        )}
      </div>
    </li>
  )
}

/** "How to fix it" as an interactive checklist: numbered steps on a timeline,
 *  each tickable, with progress kept on this browser. Manual tasks live or die
 *  by whether these read as a real procedure, so structure over prose. */
export function TaskStepsBody({
  taskId,
  steps,
}: {
  taskId: number
  steps: TaskStep[]
}): JSX.Element {
  const [done, toggle] = useStepChecklist(taskId)
  const doneCount = steps.filter((s, i) => done.has(s.n || i + 1)).length

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11.5px] font-medium text-[var(--cat-ink-3)]">
          {doneCount} of {steps.length} steps done
        </span>
        {doneCount === steps.length && steps.length > 0 && (
          <span className="rounded-full bg-[rgba(47,190,126,0.12)] px-2 py-0.5 text-[10.5px] font-semibold text-[#2FBE7E]">
            All steps done — mark the task complete
          </span>
        )}
      </div>
      <ol className="flex flex-col">
        {steps.map((step, i) => {
          const n = step.n || i + 1
          return (
            <StepRow key={n} step={step} n={n} isDone={done.has(n)} onToggle={() => toggle(n)} />
          )
        })}
      </ol>
    </div>
  )
}
