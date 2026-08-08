'use client'

import { BorderBeam } from 'border-beam'

import { CONTROL_RING } from '@/features/catalyst/components/control-styles'
import { Sparkles } from '@/lib/icons'
import { useAgentChat } from '@/stores/useAgentChat'

/** Matches the button's `rounded-md` (~8px) so the beam hugs the edge. */
const BEAM_RADIUS = 8

/**
 * Topbar button that opens the SignalorAI Agent chat panel, ringed by an animated
 * border beam. The beam runs only while the panel is closed: once the Agent is
 * open the affordance has done its job, and a permanently animating control
 * next to an open panel is just noise. `border-beam` disables its own animation
 * under `prefers-reduced-motion`.
 */
export function AgentChatTrigger(): JSX.Element {
  const open = useAgentChat(s => s.open)
  const toggle = useAgentChat(s => s.toggle)

  const base =
    'inline-flex h-[34px] w-full items-center justify-center gap-2 rounded-md px-3 text-[13px] font-medium transition-colors'
  const state = open
    ? 'bg-[#e04a3d]/10 text-[#e04a3d] ring-1 ring-[#e04a3d]/25 shadow-sm'
    : `bg-background-primary-default text-[var(--cat-ink)] hover:bg-background-secondary-default ${CONTROL_RING}`

  return (
    <BorderBeam
      active={!open}
      borderRadius={BEAM_RADIUS}
      size="sm"
      theme="auto"
      className="inline-flex w-fit min-w-0 shrink-0 flex-col items-stretch overflow-visible! leading-none"
    >
      <button
        type="button"
        onClick={toggle}
        aria-pressed={open}
        aria-label="SignalorAI Agent"
        className={`${base} ${state}`}
      >
        <Sparkles size={16} strokeWidth={1.9} className="text-[#e04a3d]" />
        <span className="hidden sm:inline">Agent</span>
      </button>
    </BorderBeam>
  )
}
