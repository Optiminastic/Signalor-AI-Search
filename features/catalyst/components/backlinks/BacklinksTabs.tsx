'use client'

import { BRAND } from '@/features/catalyst/constants'
import { Gift, Link2, ShoppingBag, Sparkles } from '@/lib/icons'
import type { LucideIcon } from '@/lib/icons'

export type BacklinkTab = 'auto' | 'gaps' | 'free' | 'paid'

interface TabDef {
  value: BacklinkTab
  label: string
  icon: LucideIcon
}

const TABS: TabDef[] = [
  { value: 'auto', label: 'Auto Backlinks', icon: Sparkles },
  // Observed gaps rank above generated suggestions: these are measured, not guessed.
  { value: 'gaps', label: 'Citation Gaps', icon: Link2 },
  { value: 'free', label: 'Free Backlinks', icon: Gift },
  { value: 'paid', label: 'Paid Backlinks', icon: ShoppingBag },
]

interface BacklinksTabsProps {
  active: BacklinkTab
  onChange: (tab: BacklinkTab) => void
}

export function BacklinksTabs({ active, onChange }: BacklinksTabsProps): JSX.Element {
  return (
    <div className="cat-rise mb-6 flex shrink-0 items-center gap-6 border-b border-[var(--cat-border)]">
      {TABS.map(({ value, label, icon: Icon }) => {
        const selected = value === active
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`flex items-center gap-2 border-b-2 pb-3 text-[14px] transition-colors ${
              selected
                ? 'font-semibold text-[var(--cat-ink)]'
                : 'border-transparent font-medium text-[var(--cat-ink-3)] hover:text-[var(--cat-ink)]'
            }`}
            style={selected ? { borderColor: BRAND } : undefined}
          >
            <Icon size={16} style={selected ? { color: BRAND } : undefined} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
