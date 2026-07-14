'use client'

import {
  Bell,
  Calendar,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useNewAnalysis } from '@/hooks/useNewAnalysis'

const CHIP =
  'inline-flex h-[34px] items-center gap-2 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] px-3 text-[13px] font-medium text-[var(--cat-ink)] shadow-sm transition-colors hover:bg-[var(--cat-hover)]'
const ICON_BTN =
  'grid h-[34px] w-[34px] place-items-center rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] text-[var(--cat-ink-2)] shadow-sm transition-colors hover:bg-[var(--cat-hover)]'
const PANEL =
  'absolute right-0 z-50 mt-2 min-w-[190px] rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] p-1 shadow-lg'

/** Lightweight dropdown: a trigger + a click-away backdrop + a panel. */
function Dropdown({
  trigger,
  children,
}: {
  trigger: (toggle: () => void) => ReactNode
  children: (close: () => void) => ReactNode
}): JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      {trigger(() => setOpen(o => !o))}
      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className={PANEL}>{children(() => setOpen(false))}</div>
        </>
      )}
    </div>
  )
}

function MenuItem({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick: () => void
  children: ReactNode
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-[13px] text-[var(--cat-ink)] transition-colors hover:bg-[var(--cat-hover)]"
    >
      <Check size={13} className={active ? 'text-[#e04a3d]' : 'opacity-0'} />
      {children}
    </button>
  )
}

function SearchButton(): JSX.Element {
  return (
    <button
      type="button"
      className={ICON_BTN}
      aria-label="Search"
      onClick={() =>
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
      }
    >
      <Search size={18} strokeWidth={1.8} />
    </button>
  )
}

function NotificationsButton(): JSX.Element {
  return (
    <Dropdown
      trigger={toggle => (
        <button type="button" className={ICON_BTN} aria-label="Notifications" onClick={toggle}>
          <Bell size={18} strokeWidth={1.8} />
        </button>
      )}
    >
      {() => (
        <div className="px-3 py-6 text-center text-[12px] text-[var(--cat-ink-3)]">
          You’re all caught up 🎉
        </div>
      )}
    </Dropdown>
  )
}

function SelectChip({
  icon: Icon,
  options,
  value,
  onChange,
}: {
  icon: LucideIcon
  options: string[]
  value: string
  onChange: (v: string) => void
}): JSX.Element {
  return (
    <Dropdown
      trigger={toggle => (
        <button type="button" className={CHIP} onClick={toggle}>
          <Icon size={16} className="text-[var(--cat-ink-2)]" /> {value}
          <ChevronDown size={15} className="text-[var(--cat-ink-3)]" />
        </button>
      )}
    >
      {close =>
        options.map(opt => (
          <MenuItem
            key={opt}
            active={opt === value}
            onClick={() => {
              onChange(opt)
              close()
            }}
          >
            {opt}
          </MenuItem>
        ))
      }
    </Dropdown>
  )
}

const RANGES = ['Last 7 days', 'Last month', 'Last 3 months', 'Last year']
const FILTERS = ['All engines', 'ChatGPT', 'Claude', 'Gemini', 'Google', 'Perplexity']

function NewAnalysisButton(): JSX.Element {
  const { email, activeOrg } = useActiveProject()
  const { trigger, isRunning } = useNewAnalysis()

  return (
    <PrimaryButton
      icon={isRunning ? undefined : Plus}
      disabled={!email || !activeOrg || isRunning}
      onClick={trigger}
    >
      {isRunning && <Loader2 size={16} className="animate-spin" />}
      {isRunning ? 'Analyzing…' : 'New Analysis'}
    </PrimaryButton>
  )
}

export function TopbarActions(): JSX.Element {
  const [range, setRange] = useState('Last month')
  const [filter, setFilter] = useState('All engines')

  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      <SearchButton />
      <NotificationsButton />
      <div className="hidden sm:block">
        <SelectChip icon={Calendar} options={RANGES} value={range} onChange={setRange} />
      </div>
      <div className="hidden md:block">
        <SelectChip
          icon={SlidersHorizontal}
          options={FILTERS}
          value={filter}
          onChange={setFilter}
        />
      </div>
      <NewAnalysisButton />
    </div>
  )
}
