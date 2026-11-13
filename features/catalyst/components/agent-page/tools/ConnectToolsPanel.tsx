'use client'

import { useState } from 'react'

import { FinderRow } from '@/features/catalyst/components/agent-page/tools/FinderRow'
import { useContactFinders, type ContactFinders } from '@/hooks/useContactFinders'

interface ConnectToolsPanelProps {
  orgSlug: string
}

interface FinderListProps {
  tools: ContactFinders
  showKeyForms: boolean
}

const NOTE = 'text-[12px] text-[var(--cat-ink-2)]'
const LINK =
  'self-start text-[11.5px] text-[var(--cat-ink-3)] underline hover:text-[var(--cat-ink)]'

function FinderList({ tools, showKeyForms }: FinderListProps): JSX.Element {
  return (
    <ul className="-mx-2.5 flex flex-col gap-0.5">
      {tools.finders.map(finder => (
        <FinderRow
          key={finder.provider}
          finder={finder}
          busy={tools.busyProvider === finder.provider}
          error={tools.actionError?.provider === finder.provider ? tools.actionError.message : null}
          showKeyForm={showKeyForms}
          onSignIn={() => tools.signIn(finder.provider)}
          onConnect={apiKey => tools.connect(finder.provider, apiKey)}
          onDisconnect={() => tools.disconnect(finder.provider)}
        />
      ))}
    </ul>
  )
}

/**
 * Connect the brand's own Hunter or Apollo account, so the agent can find the
 * right person (and their email) at sites that publish no contact address.
 */
export function ConnectToolsPanel({ orgSlug }: ConnectToolsPanelProps): JSX.Element {
  const tools = useContactFinders(orgSlug)
  const [showKeyForms, setShowKeyForms] = useState(false)
  const anyDisconnected = tools.finders.some(f => !f.connected)
  return (
    <div className="flex flex-col gap-2">
      <p className={NOTE}>
        Sign in so the agent can find contacts and emails for sites that don&apos;t list one.
      </p>
      {tools.isLoading && <p className={NOTE}>Loading…</p>}
      {tools.loadError && <p className={NOTE}>{tools.loadError}</p>}
      <FinderList tools={tools} showKeyForms={showKeyForms} />
      {anyDisconnected && !showKeyForms && (
        <button type="button" onClick={() => setShowKeyForms(true)} className={LINK}>
          Use an API key instead
        </button>
      )}
    </div>
  )
}
