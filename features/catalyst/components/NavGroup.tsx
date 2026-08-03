'use client'

import type { TablerIcon } from '@tabler/icons-react'
import { useParams, usePathname } from 'next/navigation'
import { useState } from 'react'

import { NavItem, resolveHref } from '@/features/catalyst/components/NavItem'
import type { NavEntry } from '@/features/catalyst/constants'
import { ChevronDown } from '@/lib/icons'

interface NavGroupProps {
  icon: TablerIcon
  label: string
  items: NavEntry[]
  collapsed: boolean
}

interface GroupButtonProps {
  icon: TablerIcon
  label: string
  active: boolean
  open: boolean
  onToggle: () => void
}

function GroupButton({ icon: Icon, label, active, open, onToggle }: GroupButtonProps): JSX.Element {
  // A group whose child page is active reads bold-ink (the active child itself
  // gets the white card); otherwise it's muted with the same white-pill hover.
  const stateClass = active
    ? 'font-semibold text-[var(--cat-ink)]'
    : 'text-[var(--cat-ink-2)] hover:bg-[var(--cat-card)] hover:text-[var(--cat-ink)]'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={`flex w-full items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 text-[14px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[rgba(224,74,61,0.4)] focus-visible:outline-none ${stateClass}`}
    >
      <Icon size={18} className="shrink-0" />
      {label}
      <ChevronDown
        size={15}
        className={`ml-auto text-[var(--cat-ink-3)] transition-transform ${open ? 'rotate-180' : ''}`}
      />
    </button>
  )
}

function GroupChildren({ items }: { items: NavEntry[] }): JSX.Element {
  return (
    <div className="mt-0.5 ml-[19px] flex flex-col gap-0.5 border-l border-[var(--cat-border-soft)] pl-2">
      {items.map(item => (
        <NavItem key={item.label} {...item} collapsed={false} />
      ))}
    </div>
  )
}

/** A collapsible parent nav row with indented children (e.g. Socials → Reddit). */
export function NavGroup({ icon, label, items, collapsed }: NavGroupProps): JSX.Element {
  const pathname = usePathname()
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : undefined
  const childActive = items.some(item => {
    // Same guard as NavItem: without a slug these all resolve to '/dashboard'
    // and would mark every group active on brand-less pages.
    if (!item.href.startsWith('/') && !slug) return false
    const full = resolveHref(item.href, slug)
    return pathname === full || pathname.startsWith(`${full}/`)
  })
  const [open, setOpen] = useState(childActive)
  const [wasActive, setWasActive] = useState(childActive)

  // Reveal the group when navigation lands on one of its children
  // (render-time state adjustment, not an effect).
  if (childActive !== wasActive) {
    setWasActive(childActive)
    if (childActive) setOpen(true)
  }

  if (collapsed) {
    return (
      <nav className="flex flex-col gap-0.5">
        {items.map(item => (
          <NavItem key={item.label} {...item} collapsed />
        ))}
      </nav>
    )
  }

  return (
    <div>
      <GroupButton
        icon={icon}
        label={label}
        active={childActive}
        open={open}
        onToggle={() => setOpen(o => !o)}
      />
      {open && <GroupChildren items={items} />}
    </div>
  )
}
