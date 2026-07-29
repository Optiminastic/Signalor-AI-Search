'use client'

import { AlertTriangle, Check } from '@/lib/icons'
import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'

import { TickBar } from '@/features/catalyst/components/brands/BrandBits'
import { useAnalysisProgress } from '@/hooks/useAnalysisProgress'
import { routes } from '@/lib/routes'

/** The real pipeline phases, in order. Ticker lines are actual checks the
 * analyzer runs, so the wait narrates real work instead of vamping. */
const STEPS = [
  {
    label: 'Crawling your pages',
    ticker: ['Fetching robots.txt and llms.txt', 'Walking your sitemap', 'Reading page content'],
  },
  {
    label: 'Scoring the six GEO pillars',
    ticker: [
      'Checking FAQ and Product schema',
      'Measuring content depth',
      'Verifying author and trust signals',
    ],
  },
  {
    label: 'Asking AI engines about your brand',
    ticker: [
      'Querying ChatGPT, Claude and Gemini',
      'Checking Perplexity citations',
      'Comparing you to competitors',
    ],
  },
  {
    label: 'Building your action plan',
    ticker: ['Ranking fixes by score impact', 'Estimating effort per task'],
  },
]

type StepState = 'done' | 'active' | 'next'

/** Map the run's progress onto the visible step list.
 *
 * Thresholds mirror the backend's checkpoints, which are spaced by *time*: the
 * crawl and on-page scoring finish by ~14, prompt firing owns 25-80 (about
 * two-thirds of the run), and competitors plus indexing own the rest.
 */
function activeStepFor(status: string, progress: number, done: boolean): number {
  if (done) return STEPS.length
  if (status === 'scoring' || progress >= 80) return 3
  if (progress >= 25) return 2
  if (progress >= 8) return 1
  return 0
}

function StepDot({ state }: { state: StepState }): JSX.Element {
  if (state === 'done') {
    return (
      <span className="bg-primary grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    )
  }
  if (state === 'active') {
    return (
      <span className="border-primary grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2 bg-white">
        <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
      </span>
    )
  }
  return <span className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-neutral-200" />
}

function labelClass(state: StepState): string {
  if (state === 'active') return 'text-foreground text-[13.5px] font-semibold'
  if (state === 'done') return 'text-[13.5px] text-neutral-500'
  return 'text-[13.5px] text-neutral-400'
}

interface StepRowProps {
  label: string
  state: StepState
  last: boolean
  children?: ReactNode
}

/** One timeline step: a dot, a rail down to the next step, and its label — with
 *  the live sub-status tucked right under the active one. */
function StepRow({ label, state, last, children }: StepRowProps): JSX.Element {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <StepDot state={state} />
        {!last && (
          <span
            className={`my-1 w-px flex-1 ${state === 'done' ? 'bg-primary/30' : 'bg-neutral-200'}`}
          />
        )}
      </div>
      <div className={`min-w-0 flex-1 ${last ? '' : 'pb-4'}`}>
        <span className={labelClass(state)}>{label}</span>
        {children}
      </div>
    </li>
  )
}

/** The work actually in flight, reported by the backend.
 *
 * This used to rotate invented lines on a 2.8s timer — "Querying ChatGPT,
 * Claude and Gemini" appeared whether or not anything was querying anything.
 * The pipeline now names its own stage and counts items as they finish
 * ("Asking AI engines your tracked prompts (3/10)"), so a long stage visibly
 * moves instead of looking hung. Falls back to the step's static label only
 * before the first poll lands.
 */
function Ticker({ step, phase }: { step: number; phase: string }): JSX.Element | null {
  const fallback = STEPS[Math.min(step, STEPS.length - 1)]?.ticker?.[0] ?? ''
  const line = phase || fallback
  if (!line) return null
  return (
    <p className="mt-1 text-[12px] text-neutral-400" aria-live="polite">
      {line}…
    </p>
  )
}

function DoneCard(): JSX.Element {
  return (
    <div className="mt-7 flex flex-col items-center border-t border-neutral-200/70 pt-6">
      <span className="bg-primary/10 text-primary grid h-12 w-12 place-items-center rounded-full">
        <Check className="h-6 w-6" />
      </span>
      <p className="text-foreground mt-4 text-[15px] font-semibold">Your GEO report is ready</p>
      <Link
        href={routes.dashboard}
        className="auth-cta-btn mt-4 flex h-10 w-full items-center justify-center rounded-md text-[15px] font-medium text-white"
      >
        Open the dashboard
      </Link>
    </div>
  )
}

function FailedCard(): JSX.Element {
  return (
    <div className="mt-7 flex flex-col items-center border-t border-neutral-200/70 pt-6 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <p className="text-foreground mt-4 text-[15px] font-semibold">Analysis didn&apos;t finish</p>
      <p className="mt-1 max-w-[320px] text-[12.5px] text-neutral-500">
        It stalled before completing — usually a hiccup on our side. Your brand is saved; just start
        it again from the dashboard.
      </p>
      <Link
        href={routes.dashboard}
        className="auth-cta-btn mt-4 flex h-10 w-full items-center justify-center rounded-md text-[15px] font-medium text-white"
      >
        Back to dashboard
      </Link>
    </div>
  )
}

function ProgressHeader({ progress, caption }: { progress: number; caption: string }): JSX.Element {
  return (
    <>
      <div className="flex items-center gap-2">
        <span className="bg-primary h-2 w-2 animate-pulse rounded-full" />
        <p className="text-[11px] font-semibold tracking-[0.18em] text-neutral-400 uppercase">
          SignalorAI · GEO analysis
        </p>
      </div>
      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-foreground text-[52px] leading-none font-bold tracking-tight tabular-nums">
          {progress}
          <span className="text-[26px] text-neutral-300">%</span>
        </span>
        <span className="pb-1 text-[13px] text-neutral-400">{caption}</span>
      </div>
      <div className="mt-5">
        <TickBar value={progress} ticks={44} showValue={false} />
      </div>
    </>
  )
}

export default function LoadingPage(): JSX.Element {
  const { progress, phase, done, failed, status } = useAnalysisProgress()
  const step = activeStepFor(status, progress, done)
  const caption = failed ? 'stalled' : done ? 'complete' : 'usually done in a minute or two'

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#fbfaf8] px-6 py-10 font-sans">
      <div className="w-full max-w-[440px] rounded-2xl border border-black/[0.07] bg-white p-8 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_rgba(16,24,40,0.06)]">
        <ProgressHeader progress={progress} caption={caption} />

        {failed ? (
          <FailedCard />
        ) : (
          <>
            <ol className="mt-7 flex flex-col border-t border-neutral-200/70 pt-5">
              {STEPS.map((s, i) => {
                const state: StepState = i < step ? 'done' : i === step ? 'active' : 'next'
                return (
                  <StepRow
                    key={s.label}
                    label={s.label}
                    state={state}
                    last={i === STEPS.length - 1}
                  >
                    {state === 'active' && !done && <Ticker step={step} phase={phase} />}
                  </StepRow>
                )
              })}
            </ol>

            {done ? (
              <DoneCard />
            ) : (
              <p className="mt-6 border-t border-neutral-200/70 pt-4 text-[11.5px] text-neutral-400">
                Safe to keep this tab open — we&apos;ll take you to your report automatically.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  )
}
