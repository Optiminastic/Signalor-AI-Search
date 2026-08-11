'use client'

import { TransitionLink } from '@/components/TransitionLink'
import { TaskAutoFixButton } from '@/features/catalyst/components/tasks/detail/TaskAutoFixButton'
import { TaskFixResultCard } from '@/features/catalyst/components/tasks/detail/TaskFixResultCard'
import { useBrandPath } from '@/hooks/useBrandPath'
import type { TaskAutoFix } from '@/hooks/useTaskAutoFix'
import { isGithubIntegrationError } from '@/lib/api/github'
import type { LucideIcon } from '@/lib/icons'
import { AlertTriangle, ClipboardList, GitPullRequest, Plug, RotateCw, Search } from '@/lib/icons'

const STEPS: { icon: LucideIcon; text: string }[] = [
  { icon: Search, text: 'Find the root cause of this issue' },
  { icon: ClipboardList, text: 'Propose a targeted fix' },
  { icon: GitPullRequest, text: 'Open a pull request on your repo' },
]

const ACTION =
  'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium transition-colors'

/** Idle state: what auto-fix will do (Seer-style explainer) + the trigger.
 *  Bare content — the sidebar's Auto-fix block provides the box and title. */
function AutoFixExplainer({ fix }: { fix: TaskAutoFix }): JSX.Element {
  return (
    <div>
      <p className="text-[12.5px] leading-relaxed text-[var(--cat-ink-2)]">
        SignalorAI can resolve this for you:
      </p>
      <ul className="mt-2.5 flex flex-col gap-2">
        {STEPS.map(step => (
          <li
            key={step.text}
            className="flex items-center gap-2.5 text-[12.5px] text-[var(--cat-ink)]"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[var(--cat-hover)] text-[var(--cat-ink-2)]">
              <step.icon size={13} />
            </span>
            {step.text}
          </li>
        ))}
      </ul>
      <div className="mt-3.5">
        <TaskAutoFixButton fix={fix} />
      </div>
    </div>
  )
}

/** Reconnect (primary) + Try again (for after reconnecting). */
function IntegrationActions({ fix }: { fix: TaskAutoFix }): JSX.Element {
  const brandPath = useBrandPath()
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <TransitionLink
        href={brandPath('integrations')}
        className={`${ACTION} bg-[#1f2328] text-white hover:bg-[#32383f]`}
      >
        <Plug size={13} />
        Reconnect GitHub
      </TransitionLink>
      <button
        type="button"
        onClick={fix.run}
        className={`${ACTION} border border-[var(--cat-border)] text-[var(--cat-ink-2)] hover:bg-[var(--cat-hover)]`}
      >
        <RotateCw size={13} />
        Try again
      </button>
    </div>
  )
}

/** Shown when the last fix failed on the GitHub connection (not the agent):
 *  names the problem and routes to reconnect before another attempt can run. */
function AutoFixIntegrationIssue({
  fix,
  rawError,
}: {
  fix: TaskAutoFix
  rawError: string
}): JSX.Element {
  return (
    <div>
      <div className="flex gap-2.5 rounded-md border border-[#E5484D]/25 bg-[#E5484D]/[0.07] p-3">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#E5484D]" />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--cat-ink)]">
            GitHub connection needs attention
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--cat-ink-2)]">
            SignalorAI couldn&apos;t authenticate with your repository, so it can&apos;t open a fix
            pull request. The GitHub App was likely uninstalled or lost access to this repo.
          </p>
        </div>
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-[11px] text-[var(--cat-ink-3)]">
          Technical details
        </summary>
        <p className="mt-1 font-mono text-[11px] break-words text-[var(--cat-ink-3)]">{rawError}</p>
      </details>
      <IntegrationActions fix={fix} />
    </div>
  )
}

/** The last fix's connection error, if it was an integration/auth problem. */
function integrationErrorOf(fix: TaskAutoFix): string | null {
  if (fix.phase !== 'failed' || !isGithubIntegrationError(fix.job?.error_message)) return null
  return fix.job?.error_message || 'The GitHub connection could not be authenticated.'
}

/** The task's auto-fix, in the right sidebar (Sentry "Seer" position). Surfaces a
 *  connection problem before it lets the fix run again; otherwise shows an
 *  explainer + trigger when idle, or the stepped fix flow once it's underway. */
export function TaskAutoFixPanel({ fix }: { fix: TaskAutoFix }): JSX.Element | null {
  if (!fix.visible) return null

  const integrationError = integrationErrorOf(fix)
  if (integrationError) return <AutoFixIntegrationIssue fix={fix} rawError={integrationError} />

  const hasActivity = fix.phase !== 'idle' || fix.job !== null || fix.result !== null
  return hasActivity ? <TaskFixResultCard fix={fix} /> : <AutoFixExplainer fix={fix} />
}
