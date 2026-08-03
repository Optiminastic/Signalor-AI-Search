'use client'

import { useEffect } from 'react'

import { GithubMark } from '@/components/GithubMark'
import { useOrgGithubConnection } from '@/hooks/useOrgGithubConnection'
import { CheckCircle2, Loader2, Unlink2 } from '@/lib/icons'
import { useOnboardingWizardStore } from '@/stores/useOnboardingWizardStore'

const CARD = 'shadow-input rounded-xl border border-black/8 bg-white p-5'

/** Onboarding connect flow — the shared org GitHub hook, wired to advance the
 *  wizard's "app installed" step once the connection has a target repo. */
function useGithubConnect(email: string): ReturnType<typeof useOrgGithubConnection> {
  const setAppInstalled = useOnboardingWizardStore(s => s.setAppInstalled)
  const conn = useOrgGithubConnection({ email })
  // Connected is not enough: an install that granted every repo with no clear
  // match has no target, so no fix PR can be opened. The step stays incomplete
  // until a repo is picked.
  const ready = conn.connected && !conn.needsRepoChoice && Boolean(conn.repo)
  useEffect(() => {
    setAppInstalled(ready)
  }, [ready, setAppInstalled])
  return conn
}

function LoadingCard(): JSX.Element {
  return (
    <div className={`${CARD} flex items-center justify-center gap-2 py-6`}>
      <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
      <span className="text-xs text-neutral-500">Checking GitHub connection…</span>
    </div>
  )
}

interface ConnectedCardProps {
  repo: string
  onUnlink: () => void
  unlinking: boolean
}

function ConnectedCard({ repo, onUnlink, unlinking }: ConnectedCardProps): JSX.Element {
  return (
    <div className={`${CARD} flex items-start gap-3`}>
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#047857]" />
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-[13px] font-semibold">GitHub repo connected</p>
        <p className="mt-0.5 truncate text-xs text-neutral-500">
          {repo || 'SignalorAI can now open fix PRs on your repo.'}
        </p>
        <button
          type="button"
          onClick={onUnlink}
          disabled={unlinking}
          className="hover:text-foreground mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 transition disabled:opacity-60"
        >
          {unlinking ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Unlink2 className="h-3 w-3" />
          )}
          Wrong repo? Disconnect &amp; reconnect
        </button>
      </div>
    </div>
  )
}

interface ChooseRepoCardProps {
  repositories: string[]
  reason: string
  onSelect: (repo: string) => void
  selecting: boolean
}

/**
 * Shown when the install granted several repos and none clearly matches the
 * brand — typically because the user picked "All repositories" on GitHub.
 *
 * The step stays incomplete until a repo is chosen. Opening a fix PR against a
 * guessed repository is worse than opening none, so this is a hard gate rather
 * than a suggestion.
 */
function ChooseRepoCard({
  repositories,
  reason,
  onSelect,
  selecting,
}: ChooseRepoCardProps): JSX.Element {
  return (
    <div className={`${CARD} space-y-3`}>
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#1f2328] text-white">
          <GithubMark size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-foreground text-[13px] font-semibold">Choose the repository</p>
          <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
            {reason || 'Pick the repository that holds your website, so fixes open there.'}
          </p>
        </div>
      </div>
      <select
        defaultValue=""
        disabled={selecting}
        onChange={e => e.target.value && onSelect(e.target.value)}
        aria-label="Repository for auto-fix pull requests"
        className="text-foreground h-10 w-full rounded-md border border-black/10 bg-white px-3 text-[13px] disabled:opacity-60"
      >
        <option value="" disabled>
          {selecting ? 'Saving…' : 'Select a repository…'}
        </option>
        {repositories.map(repo => (
          <option key={repo} value={repo}>
            {repo}
          </option>
        ))}
      </select>
      {repositories.length === 0 && (
        <p className="text-xs text-neutral-500">
          The install granted no repositories. Reconnect and grant access to at least one.
        </p>
      )}
    </div>
  )
}

function ConnectingCard({ onCancel }: { onCancel: () => void }): JSX.Element {
  return (
    <div className={`${CARD} space-y-2.5`}>
      <div className="flex items-center gap-2.5">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
        <p className="text-foreground text-[13px] font-medium">
          Finishing up in the GitHub window…
        </p>
      </div>
      <p className="text-xs leading-relaxed text-neutral-500">
        Pick your repository and approve access. This closes automatically once you&apos;re
        connected.
      </p>
      <button
        type="button"
        onClick={onCancel}
        className="hover:text-foreground text-xs font-medium text-neutral-500 transition"
      >
        Cancel
      </button>
    </div>
  )
}

interface ConnectCardProps {
  onConnect: () => void
  error: boolean
  notConfigured: boolean
}

function ConnectCard({ onConnect, error, notConfigured }: ConnectCardProps): JSX.Element {
  return (
    <div className={`${CARD} space-y-3`}>
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#1f2328] text-white">
          <GithubMark size={18} />
        </span>
        <div>
          <p className="text-foreground text-[13px] font-semibold">Connect your GitHub repo</p>
          <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
            Install the SignalorAI GitHub App
          </p>
        </div>
      </div>
      {notConfigured ? (
        <p className="rounded-md bg-neutral-50 px-3 py-2 text-[11px] text-neutral-500">
          GitHub connect isn&apos;t enabled on this server yet — you can skip for now.
        </p>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#1f2328] text-[13px] font-medium text-white transition hover:bg-[#32383f]"
        >
          <GithubMark size={16} />
          Connect GitHub
        </button>
      )}
      {error && (
        <p className="text-xs font-medium text-[#E5484D]">
          Couldn&apos;t start the GitHub connection. You can skip and connect later.
        </p>
      )}
    </div>
  )
}

/** Next.js → connect the GitHub App (in a popup) so SignalorAI can open fix PRs. */
export function GithubConnector({ email }: { email: string }): JSX.Element {
  const s = useGithubConnect(email)
  if (s.loading) return <LoadingCard />
  // Connected but no target repo: force the choice before the step can complete.
  if (s.connected && (s.needsRepoChoice || !s.repo))
    return (
      <ChooseRepoCard
        repositories={s.repositories}
        reason={s.repoReason}
        onSelect={s.selectRepo}
        selecting={s.selectingRepo}
      />
    )
  if (s.connected)
    return <ConnectedCard repo={s.repo} onUnlink={s.unlink} unlinking={s.unlinking} />
  if (s.connecting) return <ConnectingCard onCancel={s.cancel} />
  return <ConnectCard onConnect={s.connect} error={s.error} notConfigured={s.notConfigured} />
}
