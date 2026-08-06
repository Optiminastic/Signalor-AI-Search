'use client'

import { GithubMark } from '@/components/GithubMark'
import {
  CancelButton,
  ConnectButton,
  ConnectedBadge,
  ConnectorCard,
  ConnectorFooter,
  ConnectorSelect,
  ConnectorSpinner,
  ConnectorValue,
  type ConnectorTone,
} from '@/features/catalyst/components/integrations/ConnectorCard'
import type { OrgGithubConnection } from '@/hooks/useOrgGithubConnection'

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

function tone(gh: OrgGithubConnection): ConnectorTone {
  if (gh.needsRepoChoice) return 'attention'
  return gh.connected ? 'connected' : 'idle'
}

function Action({ gh }: { gh: OrgGithubConnection }): JSX.Element | null {
  if (gh.loading || gh.connecting) return <ConnectorSpinner />
  if (gh.connected) return gh.needsRepoChoice ? null : <ConnectedBadge />
  if (gh.notConfigured) return null
  return (
    <ConnectButton
      onClick={gh.connect}
      mark={<GithubMark size={13} />}
      className="bg-[#1f2328] hover:bg-[#32383f]"
    />
  )
}

/** When the App granted several repos, let the user pick which one fixes target;
 *  otherwise just show the single connected repo. */
function RepoControl({ gh }: { gh: OrgGithubConnection }): JSX.Element {
  if (gh.repositories.length <= 1) {
    return <ConnectorValue value={gh.repo || '—'} title={gh.repoReason} mono />
  }
  return (
    <ConnectorSelect
      value={gh.repo}
      options={gh.repositories.map(repo => ({ value: repo, label: repo }))}
      onChange={gh.selectRepo}
      disabled={gh.selectingRepo}
      needsChoice={gh.needsRepoChoice}
      placeholder="Select a repository…"
      ariaLabel="Repository for auto-fix PRs"
      title={gh.repoReason}
      mono
    />
  )
}

function Footer({ gh }: { gh: OrgGithubConnection }): JSX.Element | null {
  if (gh.connecting) return <CancelButton onClick={gh.cancel} />
  if (!gh.connected) return null
  return (
    <ConnectorFooter
      name="GitHub"
      label="Repo"
      control={<RepoControl gh={gh} />}
      onDisconnect={gh.unlink}
      disconnecting={gh.unlinking}
      disconnectTitle="Wrong repo? Disconnect & reconnect"
    />
  )
}

/** The dedicated GitHub connector: one org-level connection that opens auto-fix
 *  PRs on any repo, replacing the misleading per-framework "Next.js" card. */
export function GithubIntegrationCard({ gh }: { gh: OrgGithubConnection }): JSX.Element {
  return (
    <ConnectorCard
      name="GitHub"
      description={description(gh)}
      mark={<GithubMark size={18} />}
      markClassName="bg-[#1f2328]"
      tone={tone(gh)}
      action={<Action gh={gh} />}
      footer={<Footer gh={gh} />}
    />
  )
}
