'use client'

import type { AutoFixProofState } from '@/hooks/useTaskAutoFix'
import type { AutoFixResult } from '@/lib/api/autofix'
import { Loader2 } from '@/lib/icons'

import { AutoFixFlow } from './AutoFixFlow'
import { ExternalAction, Pill } from './FixProofBits'

// ── CMS (Shopify / Woo / WordPress) apply proof ──────────────────────────────

/** Pill tone + label for a CMS apply result. */
function cmsBadge(result: AutoFixResult | null): { tone: string; label: string } {
  if (!result) return { tone: '', label: 'Working' }
  if (result.status === 'success' || result.status === 'verified') {
    return { tone: 'applied', label: result.status === 'verified' ? 'Verified' : 'Applied' }
  }
  return { tone: result.status, label: result.status }
}

function CmsHeader({ fix }: { fix: AutoFixProofState }): JSX.Element {
  const { tone, label } = cmsBadge(fix.result)
  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-semibold text-[var(--cat-ink)] capitalize">
        {fix.platform} fix
      </span>
      <span className="ml-auto">
        {fix.phase === 'working' ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--cat-ink-2)]">
            <Loader2 size={13} className="animate-spin" /> Applying…
          </span>
        ) : (
          <Pill tone={tone}>{label}</Pill>
        )}
      </span>
    </div>
  )
}

function CmsProof({ fix }: { fix: AutoFixProofState }): JSX.Element {
  const { result, siteUrl } = fix
  return (
    <>
      <CmsHeader fix={fix} />
      {result?.message && (
        <p className="text-[12px] leading-relaxed text-[var(--cat-ink-2)]">{result.message}</p>
      )}
      {result?.generated_content && (
        <pre className="max-h-56 overflow-auto rounded-md border border-[var(--cat-border)] bg-[var(--cat-content)] p-3 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-[var(--cat-ink-2)]">
          {result.generated_content}
        </pre>
      )}
      {fix.phase === 'done' && siteUrl && (
        <ExternalAction href={siteUrl}>View the change live</ExternalAction>
      )}
    </>
  )
}

function RequestingRow(): JSX.Element {
  return (
    <p className="inline-flex items-center gap-1.5 text-[12px] text-[var(--cat-ink-2)]">
      <Loader2 size={13} className="animate-spin" />
      Opening a fix pull request on your repository…
    </p>
  )
}

function Proof({ fix }: { fix: AutoFixProofState }): JSX.Element {
  if (fix.platform !== 'nextjs') return <CmsProof fix={fix} />
  if (fix.job) return <AutoFixFlow job={fix.job} />
  return <RequestingRow />
}

/** Integration-aware proof of the auto-fix: the PR it opened or the CMS push.
 *  Bare content — the sidebar's Auto-fix block provides the box and title. */
export function TaskFixResultCard({ fix }: { fix: AutoFixProofState }): JSX.Element | null {
  const hasActivity = fix.phase !== 'idle' || fix.job !== null || fix.result !== null
  if (!hasActivity) return null
  return (
    <div className="flex flex-col gap-2.5">
      <Proof fix={fix} />
    </div>
  )
}
