import type { ReactNode } from 'react'

import { AgentChatPanel } from '@/features/catalyst/components/agent-chat/AgentChatPanel'
import { GlobalBar } from '@/features/catalyst/components/GlobalBar'
import { Sidebar } from '@/features/catalyst/components/Sidebar'

// BoardUI layout: only the sidebar is a floating card. The main content is
// plain — it sits directly on the page background with no border, radius or
// shadow — so the sidebar is the sole elevated element.
const PANEL =
  'cat-vt-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-3.5 pt-3.5 pb-3.5'

interface CatalystShellProps {
  children: ReactNode
}

/** Fixed-height app frame: pinned sidebar + a single scrollable content panel. */
export function CatalystShell({ children }: CatalystShellProps): JSX.Element {
  return (
    <div
      className="flex h-screen w-full gap-2 overflow-hidden p-2"
      // BoardUI's typeface (Inter) across the whole dashboard; cascades to children.
      style={{ background: 'var(--cat-canvas)', fontFamily: 'var(--font-boardui), sans-serif' }}
    >
      <Sidebar />
      <main className={PANEL}>
        <GlobalBar />
        {/* -mx-3/px-3: internal room for card shadows (which would otherwise clip at
            this scroll's edge), pulled back out so content still aligns with the top
            bar. The 12px extension is absorbed by the panel's px-3.5 padding. */}
        <div className="-mx-3 mt-3 flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-3 pb-3">
          {children}
        </div>
      </main>
      <AgentChatPanel />
    </div>
  )
}
