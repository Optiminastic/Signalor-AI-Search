'use client'

import { useState } from 'react'

import { CONTROL_CHIP, CONTROL_RING } from '@/features/catalyst/components/control-styles'
import { LiveVisitorsPanel } from '@/features/catalyst/components/live/LiveVisitorsPanel'
import { GREEN } from '@/features/catalyst/constants'
import { useLiveVisitors } from '@/hooks/useLiveVisitors'

// Wider than the 190px menu default: this panel carries three labelled columns,
// not a list of one-word options.
const PANEL = `absolute right-0 z-50 mt-2 w-[300px] rounded-md bg-[var(--cat-card)] p-1 shadow-lg ${CONTROL_RING}`

/**
 * Who is on the site right now, in the top bar.
 *
 * The dot is deliberately static. Part B of the design doc allows motion only
 * as an entrance, never ambient — and a permanently pulsing dot in fixed chrome
 * is the definition of ambient. Green carries the meaning; the number carries
 * the data.
 *
 * The chip never unmounts on empty data either: a control that disappears when
 * the count hits zero would reflow the whole right cluster mid-poll.
 */
export function LiveVisitorsChip(): JSX.Element {
  const [open, setOpen] = useState(false)
  const { data, total } = useLiveVisitors()

  return (
    <div className="relative hidden shrink-0 md:block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={`Live visitors: ${total}`}
        aria-expanded={open}
        className={CONTROL_CHIP}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} />
        {total}
        <span className="hidden text-[var(--cat-ink-3)] lg:inline">live</span>
      </button>
      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className={PANEL}>
            {data ? (
              <LiveVisitorsPanel data={data} />
            ) : (
              <p className="px-2 py-3 text-[11.5px] text-[var(--cat-ink-3)]">Loading…</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
