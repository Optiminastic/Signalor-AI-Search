import type { ReactNode } from 'react'

import type { LucideIcon } from '@/lib/icons'

interface AgentSectionPanelProps {
  icon: LucideIcon
  title: string
  count: number
  hint?: string
  children: ReactNode
}

/** A titled, bordered section panel — the shared building block of the agent page. */
export function AgentSectionPanel({
  icon: Icon,
  title,
  count,
  hint,
  children,
}: AgentSectionPanelProps): JSX.Element {
  return (
    <section>
      <div className="mb-1.5 flex items-center gap-2">
        <Icon size={14} className="text-[var(--cat-ink-3)]" />
        <h3 className="text-[11px] font-semibold tracking-wider text-[var(--cat-ink)] uppercase">
          {title}
        </h3>
        <span className="text-[11px] text-[var(--cat-ink-3)] tabular-nums">{count}</span>
        {hint && <span className="ml-auto text-[11px] text-[var(--cat-ink-3)]">{hint}</span>}
      </div>
      <div className="cat-card-edge overflow-hidden rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)]">
        {children}
      </div>
    </section>
  )
}
