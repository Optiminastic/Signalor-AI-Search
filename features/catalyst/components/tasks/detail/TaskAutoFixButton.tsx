'use client'

import { GithubMark } from '@/components/GithubMark'
import { TransitionLink } from '@/components/TransitionLink'
import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { useBrandPath } from '@/hooks/useBrandPath'
import type { TaskAutoFix } from '@/hooks/useTaskAutoFix'
import { ExternalLink, Loader2, Plug, Zap } from '@/lib/icons'

const OUTLINE =
  'inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--cat-border)] px-3 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors hover:bg-[var(--cat-hover)]'

function ConnectLink(): JSX.Element {
  const brandPath = useBrandPath()
  return (
    <TransitionLink href={brandPath('integrations')} className={OUTLINE}>
      <Plug size={13} />
      Connect to auto-fix
    </TransitionLink>
  )
}

function WorkingBadge(): JSX.Element {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 px-2 text-[12px] font-medium text-[var(--cat-ink-2)]">
      <Loader2 size={13} className="animate-spin" />
      Fixing…
    </span>
  )
}

/** After success: a proof link — the opened PR (GitHub), or the live page for CMS. */
function DoneLink({ fix }: { fix: TaskAutoFix }): JSX.Element | null {
  const prUrl = fix.job?.pr_url
  const prNumber = fix.job?.pr_number
  if (prUrl && prNumber) {
    return <GithubPrLink href={prUrl}>View PR #{prNumber}</GithubPrLink>
  }
  const href = prUrl || fix.siteUrl
  if (!href) return null
  return (
    <a href={href} target="_blank" rel="noreferrer" className={OUTLINE}>
      View change
      <ExternalLink size={12} />
    </a>
  )
}

/** Header CTA for the task's auto-fix, reflecting the integration's state. */
export function TaskAutoFixButton({ fix }: { fix: TaskAutoFix }): JSX.Element | null {
  if (!fix.visible) return null
  if (!fix.connected) return <ConnectLink />
  if (fix.phase === 'working') return <WorkingBadge />
  if (fix.phase === 'done') return <DoneLink fix={fix} />
  if (fix.phase === 'manual') {
    return <span className="text-[12px] font-medium text-[#a06f0a]">Manual steps below</span>
  }
  return (
    <PrimaryButton icon={Zap} onClick={fix.run}>
      {fix.phase === 'failed' ? 'Retry auto-fix' : 'Auto fix'}
    </PrimaryButton>
  )
}
