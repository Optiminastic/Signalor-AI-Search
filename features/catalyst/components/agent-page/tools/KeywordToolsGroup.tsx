'use client'

import { KeywordToolRow } from '@/features/catalyst/components/agent-page/tools/KeywordToolRow'
import { useKeywordTools } from '@/hooks/useKeywordTools'

interface KeywordToolsGroupProps {
  orgSlug: string
}

const NOTE = 'text-[12px] text-[var(--cat-ink-2)]'
const GROUP = 'text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase'

/**
 * Keyword data in the + panel. Signalor's data works out of the box; Search
 * Console adds the brand's real Google queries; a Semrush or Ahrefs key makes
 * the agent read keywords from the brand's own account instead.
 */
export function KeywordToolsGroup({ orgSlug }: KeywordToolsGroupProps): JSX.Element {
  const keywords = useKeywordTools(orgSlug)
  return (
    <>
      <p className={`mt-2 ${GROUP}`}>Keyword data</p>
      <p className={NOTE}>
        Keywords you rank for and the ones competitors win. Works out of the box; connect your own
        Semrush or Ahrefs to use your account instead.
      </p>
      {keywords.loadError && <p className={NOTE}>{keywords.loadError}</p>}
      <ul className="-mx-2.5 flex flex-col gap-0.5">
        {keywords.tools.map(tool => (
          <KeywordToolRow
            key={tool.provider}
            orgSlug={orgSlug}
            tool={tool}
            busy={keywords.busyProvider === tool.provider}
            error={
              keywords.actionError?.provider === tool.provider ? keywords.actionError.message : null
            }
            onConnect={apiKey => keywords.connect(tool.provider, apiKey)}
            onDisconnect={() => keywords.disconnect(tool.provider)}
          />
        ))}
      </ul>
    </>
  )
}
