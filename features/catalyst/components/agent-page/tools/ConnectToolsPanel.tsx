'use client'

import { FinderRow } from '@/features/catalyst/components/agent-page/tools/FinderRow'
import { useContactFinders } from '@/hooks/useContactFinders'

interface ConnectToolsPanelProps {
  orgSlug: string
}

const NOTE = 'text-[12px] text-[var(--cat-ink-2)]'

/**
 * Connect the brand's own Hunter or Apollo account, so the agent can find the
 * right person (and their email) at sites that publish no contact address.
 */
export function ConnectToolsPanel({ orgSlug }: ConnectToolsPanelProps): JSX.Element {
  const tools = useContactFinders(orgSlug)
  return (
    <div className="flex flex-col gap-2">
      <p className={NOTE}>
        Sign in to your Hunter or Apollo account. The agent uses it to find contacts and emails for
        sites that don&apos;t list one. Signalor never sees your password.
      </p>
      {tools.isLoading && <p className={NOTE}>Loading…</p>}
      {tools.loadError && <p className={NOTE}>{tools.loadError}</p>}
      <ul className="flex flex-col gap-2">
        {tools.finders.map(finder => (
          <FinderRow
            key={finder.provider}
            finder={finder}
            busy={tools.busyProvider === finder.provider}
            error={
              tools.actionError?.provider === finder.provider ? tools.actionError.message : null
            }
            onSignIn={() => tools.signIn(finder.provider)}
            onConnect={apiKey => tools.connect(finder.provider, apiKey)}
            onDisconnect={() => tools.disconnect(finder.provider)}
          />
        ))}
      </ul>
    </div>
  )
}
