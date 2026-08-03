'use client'

import { useState, type ReactNode } from 'react'

import { GithubMark } from '@/components/GithubMark'
import { Delta } from '@/features/catalyst/components/Delta'
import { BRAND } from '@/features/catalyst/constants'
import type { GithubJob } from '@/lib/api/github'
import type { LucideIcon } from '@/lib/icons'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ClipboardList,
  FileCode2,
  GitPullRequest,
  Info,
  Loader2,
  Search,
} from '@/lib/icons'

import { ExternalAction, Pill } from './FixProofBits'

/** `declined` is deliberate and expected; only `error` means something broke. */
type StepState = 'done' | 'active' | 'pending' | 'declined' | 'error'

const STEP_BASE = 'grid h-6 w-6 shrink-0 place-items-center rounded-full'

function StepIcon({ state, icon: Icon }: { state: StepState; icon: LucideIcon }): JSX.Element {
  if (state === 'done') {
    return (
      <span className={`${STEP_BASE} text-white`} style={{ background: BRAND }}>
        <Check size={13} strokeWidth={3} />
      </span>
    )
  }
  if (state === 'active') {
    return (
      <span className={`${STEP_BASE} border-2`} style={{ borderColor: BRAND, color: BRAND }}>
        <Loader2 size={12} className="animate-spin" />
      </span>
    )
  }
  if (state === 'declined') {
    return (
      <span className={`${STEP_BASE} bg-[rgba(246,185,59,0.15)] text-[#a06f0a]`}>
        <Info size={13} />
      </span>
    )
  }
  if (state === 'error') {
    return (
      <span className={`${STEP_BASE} bg-[#FDECEC] text-[#E5484D]`}>
        <AlertTriangle size={13} />
      </span>
    )
  }
  return (
    <span className={`${STEP_BASE} border-2 border-[var(--cat-border)] text-[var(--cat-ink-3)]`}>
      <Icon size={12} />
    </span>
  )
}

function stepTitleClass(state: StepState): string {
  const tone = state === 'pending' ? 'text-[var(--cat-ink-3)]' : 'text-[var(--cat-ink)]'
  return `text-[13px] font-semibold ${tone}`
}

interface StepTitleProps {
  title: string
  state: StepState
  open?: boolean
  onToggle?: () => void
}

/** A step's title — a plain label, or a chevron toggle when collapsible. */
function StepTitle({ title, state, open, onToggle }: StepTitleProps): JSX.Element {
  if (!onToggle) return <p className={stepTitleClass(state)}>{title}</p>
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center gap-1.5 text-left"
    >
      <span className={stepTitleClass(state)}>{title}</span>
      <ChevronDown
        size={13}
        className={`text-[var(--cat-ink-3)] transition-transform ${open ? '' : '-rotate-90'}`}
      />
    </button>
  )
}

interface FlowStepProps {
  icon: LucideIcon
  title: string
  state: StepState
  last?: boolean
  /** Make the step's content collapsible (for long content like the plan). */
  collapsible?: boolean
  defaultOpen?: boolean
  children: ReactNode
}

function FlowStep({
  icon,
  title,
  state,
  last,
  collapsible = false,
  defaultOpen = true,
  children,
}: FlowStepProps): JSX.Element {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <StepIcon state={state} icon={icon} />
        {!last && <span className="my-1 w-px flex-1 bg-[var(--cat-border)]" />}
      </div>
      <div className={`min-w-0 flex-1 ${last ? '' : 'pb-4'}`}>
        <StepTitle
          title={title}
          state={state}
          open={open}
          onToggle={collapsible ? () => setOpen(o => !o) : undefined}
        />
        {(!collapsible || open) && (
          <div className="mt-1 text-[12px] leading-relaxed text-[var(--cat-ink-2)]">{children}</div>
        )}
      </div>
    </div>
  )
}

function JobScore({ job }: { job: GithubJob }): JSX.Element | null {
  if (job.score_before === null || job.score_after === null) return null
  const diff = Math.round(job.score_after - job.score_before)
  return (
    <p className="mt-1 flex items-center gap-2 text-[12px] text-[var(--cat-ink-2)]">
      Score {Math.round(job.score_before)} → {Math.round(job.score_after)}
      {diff !== 0 && <Delta positive={diff > 0}>{`${Math.abs(diff)} pts`}</Delta>}
    </p>
  )
}

function FindingChips({ codes }: { codes: string[] }): JSX.Element {
  return (
    <div className="flex flex-wrap gap-1.5">
      {codes.map(c => (
        <span
          key={c}
          className="rounded-sm bg-[var(--cat-hover)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--cat-ink-2)]"
        >
          {c}
        </span>
      ))}
    </div>
  )
}

function FilesChanged({ files }: { files: GithubJob['files_changed'] }): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[var(--cat-ink-3)]">
        {files.length} file{files.length > 1 ? 's' : ''} changed
      </span>
      {files.map(f => (
        <p key={f.path}>
          <span className="mr-2 rounded-sm bg-[var(--cat-hover)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--cat-ink-2)]">
            {f.path}
          </span>
          <span className="text-[var(--cat-ink-3)]">{f.summary}</span>
        </p>
      ))}
    </div>
  )
}

function PrDetails({ job }: { job: GithubJob }): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <span className="inline-flex items-center gap-2 text-[var(--cat-ink)]">
        <GithubMark size={13} />#{job.pr_number}
        <Pill tone={job.status}>{job.status === 'open' ? 'PR open' : job.status}</Pill>
      </span>
      <ExternalAction href={job.pr_url} icon={<GithubMark size={12} />}>
        View pull request
      </ExternalAction>
    </div>
  )
}

/** How a job ended, so every step renders from one decision. */
interface JobOutcome {
  /** The agent chose not to change anything — expected, never styled as an error. */
  declined: boolean
  /** Something broke: the edits wouldn't build, or the job threw. */
  failed: boolean
}

function outcomeOf(job: GithubJob): JobOutcome {
  return { declined: job.status === 'declined', failed: job.status === 'failed' }
}

/** done wins, then the terminal outcome, then active-while-working, else pending. */
function stepState(done: boolean, active: boolean, outcome: JobOutcome): StepState {
  if (done) return 'done'
  if (outcome.declined) return 'declined'
  if (outcome.failed) return 'error'
  return active ? 'active' : 'pending'
}

function ChangesStepContent({
  job,
  outcome,
}: {
  job: GithubJob
  outcome: JobOutcome
}): JSX.Element {
  if (job.files_changed.length > 0) return <FilesChanged files={job.files_changed} />
  if (outcome.declined) return <>No code changes — this one needs a person, not a patch.</>
  if (outcome.failed) return <>—</>
  return <>Writing the changes…</>
}

/** The agent's own words on why it stopped. Presented as guidance, not an error. */
function DeclinedNote({ job }: { job: GithubJob }): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-semibold text-[var(--cat-ink)]">Needs your input</span>
      <p className="leading-relaxed text-[var(--cat-ink-2)]">
        {job.error_message ||
          'This fix needs real information that only your team can provide, so nothing was changed.'}
      </p>
    </div>
  )
}

function PrStepContent({ job, outcome }: { job: GithubJob; outcome: JobOutcome }): JSX.Element {
  if (job.pr_url) return <PrDetails job={job} />
  if (outcome.declined) return <DeclinedNote job={job} />
  if (outcome.failed)
    return <span className="text-[#E5484D]">{job.error_message || 'The fix failed.'}</span>
  if (job.files_changed.length > 0) return <>Opening a pull request…</>
  return <>Waiting to open a pull request…</>
}

/** The stepped root-cause → plan → changes → PR flow for a GitHub fix job. */
export function AutoFixFlow({ job }: { job: GithubJob }): JSX.Element {
  const outcome = outcomeOf(job)
  const hasPlan = Boolean(job.reasoning)
  const hasChanges = job.files_changed.length > 0
  // A decline still means the agent reasoned it through, so the plan reads as done.
  const planState = stepState(hasPlan, true, outcome)
  const changeState = stepState(hasChanges, hasPlan, outcome)
  const prState = stepState(Boolean(job.pr_url), hasChanges, outcome)
  return (
    <div className="flex flex-col">
      <FlowStep icon={Search} title="Root cause" state="done">
        {job.finding_codes.length ? (
          <FindingChips codes={job.finding_codes} />
        ) : (
          'Analysing the flagged issue…'
        )}
      </FlowStep>
      <FlowStep
        icon={ClipboardList}
        title="Plan"
        state={planState}
        collapsible={Boolean(job.reasoning)}
        defaultOpen={false}
      >
        {job.reasoning || (outcome.failed ? 'Could not produce a plan.' : 'Working out the fix…')}
      </FlowStep>
      <FlowStep
        icon={FileCode2}
        title="Code changes"
        state={changeState}
        collapsible={job.files_changed.length > 0}
      >
        <ChangesStepContent job={job} outcome={outcome} />
      </FlowStep>
      <FlowStep icon={GitPullRequest} title="Pull request" state={prState} last>
        <PrStepContent job={job} outcome={outcome} />
      </FlowStep>
      <JobScore job={job} />
    </div>
  )
}
