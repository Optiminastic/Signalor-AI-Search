'use client'

import { BorderBeam } from 'border-beam'
import Link from 'next/link'

import { CONTROL_RING } from '@/features/catalyst/components/control-styles'
import { useBrandPath } from '@/hooks/useBrandPath'
import { Sparkles } from '@/lib/icons'

/** Matches the button's `rounded-md` (~8px) so the beam hugs the edge. */
const BEAM_RADIUS = 8

/**
 * Topbar button that opens the full-page SignalorAI Agent for the current brand,
 * ringed by an animated border beam (`border-beam` disables its own animation
 * under `prefers-reduced-motion`).
 */
export function AgentChatTrigger(): JSX.Element {
  const brandPath = useBrandPath()

  return (
    <BorderBeam
      active
      borderRadius={BEAM_RADIUS}
      size="sm"
      theme="auto"
      className="inline-flex w-fit min-w-0 shrink-0 flex-col items-stretch overflow-visible! leading-none"
    >
      <Link
        href={brandPath('agent-mode')}
        aria-label="Open the SignalorAI Agent"
        className={`bg-background-primary-default hover:bg-background-secondary-default inline-flex h-[34px] w-full items-center justify-center gap-2 rounded-md px-3 text-[13px] font-medium text-[var(--cat-ink)] transition-colors ${CONTROL_RING}`}
      >
        <Sparkles size={16} strokeWidth={1.9} className="text-[#e04a3d]" />
        <span className="hidden sm:inline">Agent</span>
      </Link>
    </BorderBeam>
  )
}
