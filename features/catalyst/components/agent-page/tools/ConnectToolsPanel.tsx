'use client'

import { useState } from 'react'

import { BufferRow } from '@/features/catalyst/components/agent-page/tools/BufferRow'
import { FinderRow } from '@/features/catalyst/components/agent-page/tools/FinderRow'
import { GmailRow } from '@/features/catalyst/components/agent-page/tools/GmailRow'
import { useContactFinders, type ContactFinders } from '@/hooks/useContactFinders'

interface ConnectToolsPanelProps {
  orgSlug: string
}

interface FinderListProps {
  tools: ContactFinders
  showKeyForms: boolean
}

const NOTE = 'text-[12px] text-[var(--cat-ink-2)]'
const GROUP = 'text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase'
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
 * Every tool the agent can use on the brand's behalf, in one place: Gmail for
 * sending, contact finders (Hunter, Apollo) for outreach, and Buffer for social posts.
 */
export function ConnectToolsPanel({ orgSlug }: ConnectToolsPanelProps): JSX.Element {
  const tools = useContactFinders(orgSlug)
  const [showKeyForms, setShowKeyForms] = useState(false)
  const anyDisconnected = tools.finders.some(f => !f.connected)
  return (
    <div className="flex flex-col gap-2">
      <p className={GROUP}>Sending</p>
      <p className={NOTE}>
        Outreach emails and pitches go out from your own Gmail, after you approve each.
      </p>
      <ul className="-mx-2.5 flex flex-col gap-0.5">
        <GmailRow orgSlug={orgSlug} />
      </ul>
      <p className={`mt-2 ${GROUP}`}>Find contacts</p>
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
      <p className={`mt-2 ${GROUP}`}>Social posting</p>
      <p className={NOTE}>Approved social posts go to your Buffer queue.</p>
      <ul className="-mx-2.5 flex flex-col gap-0.5">
        <BufferRow orgSlug={orgSlug} />
      </ul>
    </div>
  )
}
