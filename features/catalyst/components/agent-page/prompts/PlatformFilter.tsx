import type { ReactNode } from 'react'

import { PlatformMark } from '@/features/catalyst/components/agent-page/prompts/PlatformMark'
import {
  PLATFORM_META,
  PLATFORM_ORDER,
} from '@/features/catalyst/components/agent-page/prompts/platforms'
import type { Platform } from '@/lib/api/agent-mode-prompt-presence'

export type PlatformChoice = Platform | 'all'

interface PlatformFilterProps {
  value: PlatformChoice
  onChange: (next: PlatformChoice) => void
  counts: Record<Platform, number>
}

const CHIP =
  'inline-flex h-[30px] items-center gap-1.5 rounded-md border px-2.5 text-[12.5px] font-medium transition-colors'
const ON = 'border-[var(--cat-ink)] bg-[var(--cat-hover)] text-[var(--cat-ink)]'
const OFF = 'border-[var(--cat-border)] text-[var(--cat-ink-2)] hover:bg-[var(--cat-hover)]'

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
}): JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`${CHIP} ${selected ? ON : OFF}`}
    >
      {children}
    </button>
  )
}

/** Show every platform, or one: Reddit, LinkedIn, X or Google, each with its count. */
export function PlatformFilter({ value, onChange, counts }: PlatformFilterProps): JSX.Element {
  const total = PLATFORM_ORDER.reduce((sum, p) => sum + counts[p], 0)
  return (
    <div role="group" aria-label="Filter by platform" className="flex flex-wrap gap-1.5">
      <Chip selected={value === 'all'} onClick={() => onChange('all')}>
        All <span className="text-[var(--cat-ink-3)] tabular-nums">{total}</span>
      </Chip>
      {PLATFORM_ORDER.map(p => (
        <Chip key={p} selected={value === p} onClick={() => onChange(p)}>
          <PlatformMark platform={p} size={14} />
          {PLATFORM_META[p].name}
          <span className="text-[var(--cat-ink-3)] tabular-nums">{counts[p]}</span>
        </Chip>
      ))}
    </div>
  )
}
