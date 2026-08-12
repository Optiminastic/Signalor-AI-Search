'use client'

import type { ReactNode } from 'react'

import { Chip, type ChipColor } from '@/components/base/badges/chip'
import { ExternalLink } from '@/lib/icons'

/**
 * Status tones for a fix result.
 *
 * `declined` shares the amber "needs a human" tone with `manual` on purpose: the
 * agent choosing not to invent data is an expected hand-off, not a failure, and
 * must never carry the red `failed` tone.
 */
export const PILL_TONE: Record<string, ChipColor> = {
  open: 'yellow',
  merged: 'lime',
  applied: 'lime',
  manual: 'yellow',
  declined: 'yellow',
  failed: 'rose',
}

export function Pill({ tone, children }: { tone: string; children: string }): JSX.Element {
  return (
    <Chip variant="caption" color={PILL_TONE[tone] ?? 'neutral'} className="capitalize">
      {children}
    </Chip>
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
