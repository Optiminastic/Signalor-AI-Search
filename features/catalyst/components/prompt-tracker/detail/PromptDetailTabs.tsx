'use client'

import { BRAND } from '@/features/catalyst/constants'
import { BarChart3, Layers, LayoutGrid, Quote, Timer } from '@/lib/icons'
import type { LucideIcon } from '@/lib/icons'

export type PromptDetailTab = 'overview' | 'models' | 'history' | 'citations' | 'answers'

interface TabDef {
  value: PromptDetailTab
  label: string
  icon: LucideIcon
}

const TABS: TabDef[] = [
  { value: 'overview', label: 'Overview', icon: LayoutGrid },
  { value: 'models', label: 'Models', icon: BarChart3 },
  { value: 'history', label: 'History', icon: Timer },
  { value: 'citations', label: 'Citations', icon: Quote },
  { value: 'answers', label: 'Answers', icon: Layers },
]

interface PromptDetailTabsProps {
  active: PromptDetailTab
  counts: Partial<Record<PromptDetailTab, number>>
  onChange: (tab: PromptDetailTab) => void
}

/** Underline tabs pinned under the sheet header — matches BacklinksTabs. */
export function PromptDetailTabs({ active, counts, onChange }: PromptDetailTabsProps): JSX.Element {
  return (
    <div
      role="tablist"
      className="flex shrink-0 items-center gap-5 overflow-x-auto border-b border-[var(--cat-border)] bg-[var(--cat-card)] px-4"
    >
      {TABS.map(({ value, label, icon: Icon }) => {
        const selected = value === active
        const count = counts[value]
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(value)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 pb-2.5 text-[13px] whitespace-nowrap transition-colors ${
              selected
                ? 'font-semibold text-[var(--cat-ink)]'
                : 'border-transparent font-medium text-[var(--cat-ink-3)] hover:text-[var(--cat-ink)]'
            }`}
            style={{ paddingTop: 10, borderColor: selected ? BRAND : undefined }}
          >
            <Icon size={15} style={selected ? { color: BRAND } : undefined} />
            {label}
            {count !== undefined && count > 0 && (
              <span className="rounded-full bg-[var(--cat-hover)] px-1.5 text-[10px] font-semibold tabular-nums">
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
