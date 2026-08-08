'use client'

import Link from 'next/link'
import { useState } from 'react'

import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useDraggableFloater, type DragHandle } from '@/hooks/useDraggableFloater'
import { useMounted } from '@/hooks/useMounted'
import { useOnboardingSteps, type OnboardingStep } from '@/hooks/useOnboardingSteps'
import { Check, ChevronRight, ListChecks, Minus, PartyPopper } from '@/lib/icons'

const DISMISS_KEY = 'signalor.onboarding.dismissed'
const OPEN_KEY = 'signalor.onboarding.open'
const POSITION_KEY = 'signalor.onboarding.position'

/** Read a persisted boolean flag, guarding SSR where localStorage is absent. */
function readFlag(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback
  const value = window.localStorage.getItem(key)
  return value === null ? fallback : value === '1'
}

function StepIcon({ done }: { done: boolean }): JSX.Element {
  if (done) {
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e04a3d] text-white">
        <Check size={13} strokeWidth={3} />
      </span>
    )
  }
  return (
    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-dashed border-[var(--cat-border)]" />
  )
}

function StepRow({ step, active }: { step: OnboardingStep; active: boolean }): JSX.Element {
  return (
    <Link
      href={step.href}
      className={`block rounded-md px-2.5 py-2 transition-colors ${
        active ? 'bg-[var(--cat-hover)]' : 'hover:bg-[var(--cat-hover)]'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <StepIcon done={step.done} />
        <span
          className={`flex-1 truncate text-[13px] font-medium ${
            step.done ? 'text-[var(--cat-ink-3)] line-through' : 'text-[var(--cat-ink)]'
          }`}
        >
          {step.title}
        </span>
        {!step.done && <ChevronRight size={15} className="shrink-0 text-[var(--cat-ink-3)]" />}
      </div>
      {active && !step.done && (
        <div className="mt-1.5 pl-[30px]">
          <p className="text-[12px] leading-relaxed text-[var(--cat-ink-3)]">{step.description}</p>
          <span className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-md bg-[#e04a3d] px-3 text-[12px] font-semibold text-white">
            {step.cta}
            <ChevronRight size={14} strokeWidth={2.4} />
          </span>
        </div>
      )}
    </Link>
  )
}

interface CollapsedTriggerProps {
  completed: number
  total: number
  onOpen: () => void
  drag: DragHandle
}

/** The pill doubles as its own drag handle; the hook swallows the click that
 *  follows a real drag, so it only opens the card on a genuine press. */
function CollapsedTrigger({ completed, total, onOpen, drag }: CollapsedTriggerProps): JSX.Element {
  return (
    <button
      type="button"
      onPointerDown={drag.startDrag}
      onClick={onOpen}
      className={`inline-flex touch-none items-center gap-2 rounded-full bg-[var(--cat-card)] py-2 pr-3.5 pl-2.5 text-[13px] font-semibold text-[var(--cat-ink)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] ring-1 ring-black/10 select-none dark:ring-white/10 ${
        drag.dragging
          ? 'cursor-grabbing'
          : 'cursor-grab transition-transform hover:-translate-y-0.5'
      }`}
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e04a3d]/10 text-[#e04a3d]">
        <ListChecks size={14} />
      </span>
      Getting started
      <span className="rounded-full bg-[var(--cat-hover)] px-2 py-0.5 text-[11px] text-[var(--cat-ink-2)] tabular-nums">
        {completed}/{total}
      </span>
    </button>
  )
}

interface CardProps {
  steps: OnboardingStep[]
  completed: number
  total: number
  allDone: boolean
  onCollapse: () => void
  onDismiss: () => void
  drag: DragHandle
}

interface CardHeaderProps {
  completed: number
  total: number
  onCollapse: () => void
  drag: DragHandle
}

/** Header doubles as the card's drag handle; the step links below stay clickable. */
function CardHeader({ completed, total, onCollapse, drag }: CardHeaderProps): JSX.Element {
  return (
    <div
      onPointerDown={drag.startDrag}
      className={`flex touch-none items-start justify-between gap-2 px-4 pt-4 select-none ${
        drag.dragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <div>
        <p className="text-[14px] font-semibold text-[var(--cat-ink)]">
          Get started with SignalorAI
        </p>
        <p className="mt-0.5 text-[12px] text-[var(--cat-ink-3)]">
          {completed} of {total} complete
        </p>
      </div>
      <button
        type="button"
        aria-label="Minimize"
        onClick={onCollapse}
        // Keep the press on the button from starting a drag of the card.
        onPointerDown={e => e.stopPropagation()}
        className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
      >
        <Minus size={16} />
      </button>
    </div>
  )
}

function OnboardingCard({
  steps,
  completed,
  total,
  allDone,
  onCollapse,
  onDismiss,
  drag,
}: CardProps): JSX.Element {
  const activeId = steps.find(s => !s.done)?.id
  return (
    <div className="bg-background-primary-default w-[330px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-xl shadow-[0_20px_50px_-16px_rgba(0,0,0,0.35)] ring-1 ring-black/10 dark:ring-white/10">
      <CardHeader completed={completed} total={total} onCollapse={onCollapse} drag={drag} />
      <div className="px-4 pt-3">
        <TickBar value={(completed / total) * 100} ticks={total * 4} showValue={false} />
      </div>
      {allDone ? (
        <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
          <PartyPopper size={22} className="text-[#e04a3d]" />
          <p className="text-[13px] font-semibold text-[var(--cat-ink)]">You’re all set!</p>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-1 rounded-md bg-[#e04a3d] px-3 py-1.5 text-[12px] font-semibold text-white"
          >
            Dismiss
          </button>
        </div>
      ) : (
        <div className="space-y-0.5 p-2">
          {steps.map(s => (
            <StepRow key={s.id} step={s} active={s.id === activeId} />
          ))}
        </div>
      )}
    </div>
  )
}

interface Visibility {
  open: boolean
  dismissed: boolean
  setOpen: (next: boolean) => void
  dismiss: () => void
}

/**
 * Open/dismissed state, persisted. The lazy initializers read the saved
 * preference on the client (SSR-guarded), so there's no set-state-in-effect churn.
 */
function useOnboardingVisibility(): Visibility {
  const [open, setOpenState] = useState(() => readFlag(OPEN_KEY, true))
  const [dismissed, setDismissed] = useState(() => readFlag(DISMISS_KEY, false))

  const setOpen = (next: boolean): void => {
    setOpenState(next)
    localStorage.setItem(OPEN_KEY, next ? '1' : '0')
  }
  const dismiss = (): void => {
    setDismissed(true)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  return { open, dismissed, setOpen, dismiss }
}

export function OnboardingFloater(): JSX.Element | null {
  const mounted = useMounted()
  const { orgSlug } = useActiveProject()
  const { steps, completed, total, allDone } = useOnboardingSteps()
  const { open, dismissed, setOpen, dismiss } = useOnboardingVisibility()
  // Destructured rather than kept as one object: the react-hooks/refs lint pass
  // taints a hook result that closes over refs, so member access on it in render
  // would be flagged even though nothing here reads a ref.
  const { setContainer, style: dragStyle, dragging, startDrag } = useDraggableFloater(POSITION_KEY)
  const drag: DragHandle = { dragging, startDrag }

  if (!mounted || !orgSlug || dismissed) return null

  return (
    <div
      ref={setContainer}
      style={dragStyle}
      // Parked bottom-right until the user drags it; after that `style` pins
      // explicit left/top coordinates instead.
      className={`fixed z-40 flex flex-col items-end print:hidden ${
        dragStyle ? '' : 'right-5 bottom-5'
      }`}
    >
      {open ? (
        <OnboardingCard
          steps={steps}
          completed={completed}
          total={total}
          allDone={allDone}
          onCollapse={() => setOpen(false)}
          onDismiss={dismiss}
          drag={drag}
        />
      ) : (
        <CollapsedTrigger
          completed={completed}
          total={total}
          onOpen={() => setOpen(true)}
          drag={drag}
        />
      )}
    </div>
  )
}
