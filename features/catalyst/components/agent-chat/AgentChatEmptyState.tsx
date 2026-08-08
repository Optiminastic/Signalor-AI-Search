'use client'

import { AgentChatSuggestions } from '@/features/catalyst/components/agent-chat/AgentChatSuggestions'
import { Sparkles } from '@/lib/icons'

/** Faint dotted field behind the intro, echoing the empty-canvas look. */
const DOT_FIELD = 'radial-gradient(var(--cat-border) 1px, transparent 1px) 0 0 / 16px 16px'

/** The Agent panel body before any conversation exists: intro + starters. */
export function AgentChatEmptyState(): JSX.Element {
  return (
    <div className="cat-rise flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-5">
      <div
        className="cat-card-edge grid h-28 shrink-0 place-items-center rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)]"
        style={{ backgroundImage: DOT_FIELD }}
      >
        <span className="grid h-11 w-11 place-items-center rounded-md bg-[#e04a3d]/10 text-[#e04a3d] ring-1 ring-[#e04a3d]/20">
          <Sparkles size={22} strokeWidth={1.9} />
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-[var(--cat-ink)]">SignalorAI Agent</h2>
          <span className="rounded-full bg-[var(--cat-track)] px-1.5 py-px text-[10px] font-semibold tracking-wide text-[var(--cat-ink-2)] uppercase">
            Beta
          </span>
        </div>
        <p className="text-[13px] leading-relaxed text-[var(--cat-ink-2)]">
          The Agent can help you understand your GEO scores, explain competitor gaps, and plan the
          next fixes across your brands.{' '}
          <a href="#" className="font-medium text-[#e04a3d] hover:underline">
            Learn more
          </a>
        </p>
        <p className="text-[12px] leading-relaxed text-[var(--cat-ink-3)]">
          By using the Agent you agree it may review your workspace data to answer questions and
          improve the product.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
          Try asking
        </p>
        <AgentChatSuggestions />
      </div>
    </div>
  )
}
