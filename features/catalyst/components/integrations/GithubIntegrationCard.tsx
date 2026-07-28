'use client'

import { GithubMark } from '@/components/GithubMark'
import type { OrgGithubConnection } from '@/hooks/useOrgGithubConnection'
import { Check, Loader2, Unlink2 } from '@/lib/icons'

const CARD_BASE =
  'group relative flex flex-col rounded-md border p-3.5 transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(16,24,40,.07)]'

function description(gh: OrgGithubConnection): string {
  if (gh.notConfigured) return "GitHub connect isn't enabled on this server yet."
  // Several repos are connected but none is clearly this brand's site, so no PR
  // can be opened until the user says which one.
  if (gh.needsRepoChoice)
    return 'Choose which connected repository this brand should open fix PRs against.'
  if (gh.connected) return 'Auto-fix PRs enabled — works with Next.js, Astro, or any framework.'
  if (gh.connecting) return 'Pick your repository and approve access in the GitHub window.'
  return 'Connect your repo so SignalorAI can open fix PRs. Works with any framework.'
}

function TopAction({ gh }: { gh: OrgGithubConnection }): JSX.Element | null {
  if (gh.loading || gh.connecting)
    return <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
  if (gh.connected) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(47,190,126,0.12)] px-2 py-0.5 text-[11px] font-semibold text-[#1e8a5c]">
        <Check size={12} strokeWidth={3} />
        Connected
      </span>
    )
  }
  if (gh.notConfigured) return null
  return (
    <button
      type="button"
      onClick={gh.connect}
      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1f2328] px-3 text-[12px] font-medium text-white transition-colors hover:bg-[#32383f]"
    >
      <GithubMark size={13} />
      Connect
    </button>
  )
}

function Footer({ gh }: { gh: OrgGithubConnection }): JSX.Element | null {
  if (gh.connecting) {
    return (
      <button
        type="button"
        onClick={gh.cancel}
        className="mt-2.5 self-start text-[11.5px] font-medium text-neutral-500 transition-colors hover:text-[var(--cat-ink)]"
      >
        Cancel
      </button>
    )
  }
  if (!gh.connected) return null
  return (
    <div className="mt-2.5 flex items-center justify-between gap-2">
      <RepoPicker gh={gh} />
      <button
        type="button"
        onClick={gh.unlink}
        disabled={gh.unlinking}
        title="Wrong repo? Disconnect &amp; reconnect"
        className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-neutral-500 transition-colors hover:text-[var(--cat-ink)] disabled:opacity-60"
      >
        {gh.unlinking ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Unlink2 className="h-3 w-3" />
        )}
        Disconnect
      </button>
    </div>
  )
}

/** When the App granted several repos, let the user pick which one fixes target;
 *  otherwise just show the single connected repo. */
function RepoPicker({ gh }: { gh: OrgGithubConnection }): JSX.Element {
  if (gh.repositories.length <= 1) {
    if (!gh.repo) return <span className="min-w-0 flex-1" />
    return (
      <span
        title={gh.repoReason}
        className="min-w-0 flex-1 truncate rounded-sm bg-[var(--cat-hover)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--cat-ink-2)]"
      >
        {gh.repo}
      </span>
    )
  }
  const edge = gh.needsRepoChoice ? 'border-[#e04a3d]' : 'border-[var(--cat-border)]'
  return (
    <label className="flex min-w-0 flex-1 items-center gap-1.5">
      <span className="shrink-0 text-[11px] text-[var(--cat-ink-3)]">Repo</span>
      <select
        value={gh.repo}
        disabled={gh.selectingRepo}
        onChange={e => gh.selectRepo(e.target.value)}
        aria-label="Repository for auto-fix PRs"
        title={gh.repoReason}
        className={`min-w-0 flex-1 truncate rounded-md border ${edge} bg-[var(--cat-card)] px-1.5 py-1 font-mono text-[11px] text-[var(--cat-ink-2)] outline-none disabled:opacity-60`}
      >
        {/* No target yet: force a deliberate pick rather than defaulting to
            whichever repo happens to be first in the list. */}
        {gh.needsRepoChoice && <option value="">Select a repository…</option>}
        {gh.repositories.map(repo => (
          <option key={repo} value={repo}>
            {repo}
          </option>
        ))}
      </select>
    </label>
  )
}

/** The dedicated GitHub connector: one org-level connection that opens auto-fix
 *  PRs on any repo, replacing the misleading per-framework "Next.js" card. */
export function GithubIntegrationCard({ gh }: { gh: OrgGithubConnection }): JSX.Element {
  const border = gh.connected
    ? 'border-[rgba(47,190,126,0.4)] bg-[rgba(47,190,126,0.035)]'
    : 'border-[var(--cat-border)] bg-[var(--cat-card)]'
  return (
    <div className={`${CARD_BASE} ${border}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#1f2328] text-white">
          <GithubMark size={18} />
        </span>
        <TopAction gh={gh} />
      </div>
      <p className="mt-3 text-[13.5px] font-semibold text-[var(--cat-ink)]">GitHub</p>
      <p className="mt-1 text-[12px] leading-snug text-[var(--cat-ink-2)]">{description(gh)}</p>
      <Footer gh={gh} />
    </div>
  )
}
