'use client'

import type { ReactNode } from 'react'

import { ExternalLink } from '@/lib/icons'

/**
 * Status tones for a fix result.
 *
 * `declined` shares the amber "needs a human" tone with `manual` on purpose: the
 * agent choosing not to invent data is an expected hand-off, not a failure, and
 * must never carry the red `failed` tone.
 */
export const PILL_TONE: Record<string, string> = {
  open: 'bg-[rgba(246,185,59,0.15)] text-[#a06f0a]',
  merged: 'bg-[#E7F7EF] text-[#1e8a5c]',
  applied: 'bg-[#E7F7EF] text-[#1e8a5c]',
  manual: 'bg-[rgba(246,185,59,0.15)] text-[#a06f0a]',
  declined: 'bg-[rgba(246,185,59,0.15)] text-[#a06f0a]',
  failed: 'bg-[#FDECEC] text-[#E5484D]',
}

export function Pill({ tone, children }: { tone: string; children: string }): JSX.Element {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${PILL_TONE[tone] ?? 'bg-[var(--cat-hover)] text-[var(--cat-ink-2)]'}`}
    >
      {children}
    </span>
  )
}

interface ExternalActionProps {
  href: string
  /** Leading icon (e.g. the GitHub mark for a PR); defaults to a trailing arrow. */
  icon?: ReactNode
  children: string
}

export function ExternalAction({ href, icon, children }: ExternalActionProps): JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 self-start rounded-md border border-[var(--cat-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--cat-ink)] transition-colors hover:bg-[var(--cat-hover)]"
    >
      {icon}
      {children}
      {icon ? null : <ExternalLink size={12} />}
    </a>
  )
}
