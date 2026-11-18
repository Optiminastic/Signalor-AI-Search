'use client'

import { RankTrackingPanel } from '@/features/catalyst/components/agent-page/tracking/RankTrackingPanel'
import { useTrackingRailOpen } from '@/hooks/useTrackingRailOpen'
import { ChevronLeft, TrendingUp } from '@/lib/icons'

interface TrackingRailProps {
  orgSlug: string
}

const SURFACE =
  'cat-agent-canvas hidden min-h-0 shrink-0 flex-col rounded-[22px] border border-white/80 bg-[var(--cat-content)]/90 shadow-[0_10px_40px_rgba(120,60,30,.08)] backdrop-blur-xl min-[1440px]:flex dark:border-white/10'

/** The column folded to a thin strip: click anywhere on it to open again. */
function ClosedStrip({ onOpen }: { onOpen: () => void }): JSX.Element {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open You vs competitors"
      aria-expanded={false}
      className={`${SURFACE} w-11 items-center gap-3 py-4 text-[var(--cat-ink-2)] transition-colors hover:text-[var(--cat-ink)]`}
    >
      <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
      <TrendingUp size={16} strokeWidth={2} className="text-[#e04a3d]" aria-hidden="true" />
      <span className="text-[12px] font-semibold [writing-mode:vertical-rl]">
        You vs competitors
      </span>
    </button>
  )
}

/**
 * Third column, right of the board, on wide screens (1440px+): the weekly
 * SEO / GEO / Brand tracking. It folds to a thin strip and remembers that per
 * browser. Below 1440px the board shows it as a tab instead.
 */
export function TrackingRail({ orgSlug }: TrackingRailProps): JSX.Element {
  const { open, setOpen } = useTrackingRailOpen()
  if (!open) return <ClosedStrip onOpen={() => setOpen(true)} />
  return (
    <aside
      aria-label="You vs competitors"
      className={`${SURFACE} w-[400px] overflow-y-auto px-5 py-5`}
    >
      <RankTrackingPanel orgSlug={orgSlug} onClose={() => setOpen(false)} />
    </aside>
  )
}
